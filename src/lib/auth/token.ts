import { jwtVerify, SignJWT } from "jose";
import { getSessionSecret } from "@/lib/config/env";

/**
 * Creación y verificación del token de sesión. Módulo puro (sin next/headers),
 * para poder usarlo tanto desde las páginas/acciones como desde `proxy.ts`.
 */

const ISSUER = "atwosaint";
const AUDIENCE = "atwosaint-admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const isProd = process.env.NODE_ENV === "production";

/** `__Host-` exige HTTPS, Path=/ y sin Domain; en local (http) se usa el nombre simple. */
export const SESSION_COOKIE = isProd ? "__Host-atw_session" : "atw_session";

const key = () => new TextEncoder().encode(getSessionSecret());

export async function createSessionToken(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, key(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}
