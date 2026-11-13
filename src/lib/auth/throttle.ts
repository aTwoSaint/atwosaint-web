import "server-only";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { getSessionSecret } from "@/lib/config/env";
import { getDb } from "@/lib/db";
import { loginAttempts } from "@/lib/db/schema";
import { clientIp, isLocked, throttleKey, WINDOW_MS } from "./throttle-policy";

/**
 * Registro de intentos fallidos en la base de datos (las funciones serverless no comparten memoria).
 * Si la tabla aún no existe o la base falla, NO se bloquea el acceso (se avisa en el registro):
 * es preferible a dejar al propietario fuera, y las demás barreras (scrypt + contraseña larga) siguen activas.
 */
async function currentKey(): Promise<string> {
  return throttleKey(clientIp(await headers()), getSessionSecret());
}

export async function isLoginLocked(): Promise<boolean> {
  try {
    const key = await currentKey();
    const since = new Date(Date.now() - WINDOW_MS);
    const [row] = await getDb()
      .select({ n: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.key, key), gt(loginAttempts.createdAt, since)));
    return isLocked(row?.n ?? 0);
  } catch (error) {
    console.warn("Acceso: no se pudo comprobar el límite de intentos (¿falta la migración 0003?).", error);
    return false;
  }
}

export async function recordLoginFailure(): Promise<void> {
  try {
    const db = getDb();
    await db.insert(loginAttempts).values({ key: await currentKey() });
    // Limpieza: nada de más de un día.
    await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
  } catch (error) {
    console.warn("Acceso: no se pudo registrar el intento fallido.", error);
  }
}

export async function clearLoginFailures(): Promise<void> {
  try {
    await getDb().delete(loginAttempts).where(eq(loginAttempts.key, await currentKey()));
  } catch {
    /* sin consecuencias */
  }
}
