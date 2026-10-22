import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "./token";

const isProd = process.env.NODE_ENV === "production";

/** Pista no sensible para mostrar el botón de administrador. No concede ningún acceso. */
export const HINT_COOKIE = "atw_admin";

/** Comparación en tiempo constante, independiente de la longitud. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  const common = {
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
  store.set(SESSION_COOKIE, await createSessionToken(), {
    ...common,
    httpOnly: true,
  });
  store.set(HINT_COOKIE, "1", { ...common, httpOnly: false });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(HINT_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : false;
}

/** Cada página y cada acción de administración debe llamar a esto antes de hacer nada. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
