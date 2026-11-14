import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

/**
 * Actualización de la base de datos desde el propio panel (solo administrador).
 *
 * Son EXACTAMENTE los cambios de drizzle/0003 y drizzle/0004: solo añaden y todas las sentencias son
 * idempotentes (IF NOT EXISTS), así que se pueden ejecutar varias veces sin riesgo y no tocan datos.
 * Son sentencias fijas: nada de lo que llega de un formulario entra en ellas.
 */
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "login_attempts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "key" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "login_attempts_key_created_idx" ON "login_attempts" USING btree ("key","created_at")`,
  `ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "slug" text`,
  `ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "bpm" integer`,
  `ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "musical_key" text`,
  `ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "description" text`,
  `ALTER TABLE "tracks" ADD COLUMN IF NOT EXISTS "released_on" date`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "tracks_slug_unique_idx" ON "tracks" ("slug")`,
];

/** Qué falta por aplicar. Vacío = la base de datos está al día. */
export async function pendingUpgrades(): Promise<string[]> {
  const db = getDb();
  const cols = await db.execute(
    sql`select column_name from information_schema.columns where table_schema = 'public' and table_name = 'tracks'`,
  );
  const have = new Set(cols.rows.map((r) => String((r as { column_name: string }).column_name)));
  const missing: string[] = [];
  if (have.size > 0 && !["slug", "bpm", "musical_key", "description", "released_on"].every((c) => have.has(c))) {
    missing.push("Ficha de los beats (BPM, tonalidad, fecha, descripción y dirección propia)");
  }
  const tables = await db.execute(
    sql`select 1 as ok from information_schema.tables where table_schema = 'public' and table_name = 'login_attempts'`,
  );
  if (tables.rows.length === 0) missing.push("Freno de intentos de acceso");
  return missing;
}

export async function applyUpgrades(): Promise<void> {
  const db = getDb();
  for (const statement of STATEMENTS) await db.execute(sql.raw(statement));
}
