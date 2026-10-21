"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const hasHint = () =>
  document.cookie.split("; ").some((c) => c === "atw_admin=1");

/**
 * Muestra el acceso al panel solo si existe la cookie de pista del administrador.
 * Es solo comodidad visual: la autorización real se comprueba siempre en el servidor,
 * y así las páginas públicas siguen siendo estáticas.
 */
export function AdminLink() {
  const visible = useSyncExternalStore(subscribe, hasHint, () => false);
  if (!visible) return null;
  return (
    <Link
      href="/admin"
      className="font-mono text-xs uppercase tracking-widest text-accent underline-offset-8 hover:underline"
    >
      + Añadir
    </Link>
  );
}
