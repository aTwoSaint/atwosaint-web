"use client";

import Link from "next/link";
import { useAdminHint } from "./useAdminHint";

/** Muestra el acceso al panel solo si existe la cookie de pista del administrador. */
export function AdminLink() {
  if (!useAdminHint()) return null;
  return (
    <Link
      href="/admin"
      className="font-mono text-xs uppercase tracking-widest text-accent-ink underline-offset-8 hover:underline"
    >
      + Añadir
    </Link>
  );
}
