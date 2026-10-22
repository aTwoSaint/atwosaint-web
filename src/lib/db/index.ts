import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseEnv } from "@/lib/config/env";
import * as schema from "./schema";

let cached: ReturnType<typeof create> | undefined;

function create() {
  const { DATABASE_URL } = getDatabaseEnv();
  return drizzle(neon(DATABASE_URL), { schema });
}

/** Conexión HTTP a Neon (adecuada para funciones serverless). Se crea al primer uso. */
export function getDb() {
  cached ??= create();
  return cached;
}
