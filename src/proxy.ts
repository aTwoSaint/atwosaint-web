import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

/**
 * Primera barrera para /admin: sin sesión válida se redirige (307) antes de renderizar.
 * No sustituye a la comprobación de cada página y acción (`requireAdmin`), que sigue siendo
 * la autoridad. /admin/login queda fuera para poder iniciar sesión.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && (await verifySessionToken(token))) return NextResponse.next();

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
