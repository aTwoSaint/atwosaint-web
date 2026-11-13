import { createHmac } from "node:crypto";

/**
 * Política de bloqueo del acceso (pura, sin base de datos, para poder probarla).
 * Más de MAX_FAILURES intentos fallidos desde la misma conexión en WINDOW_MS ⇒ se rechaza
 * sin ni siquiera comprobar la contraseña. Es por conexión (no global) para que un atacante
 * no pueda dejar fuera al propietario.
 */
export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

export const isLocked = (failuresInWindow: number): boolean => failuresInWindow >= MAX_FAILURES;

/** IP del cliente según las cabeceras que fija la plataforma (Vercel sobrescribe las del cliente). */
export function clientIp(headers: { get(name: string): string | null }): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "desconocida";
}

/** Identificador anónimo y estable de una conexión: no permite recuperar la IP. */
export function throttleKey(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(`login:${ip}`).digest("hex");
}
