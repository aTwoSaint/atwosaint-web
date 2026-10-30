"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const hasHint = () =>
  document.cookie.split("; ").some((c) => c === "atw_admin=1");

/**
 * ¿Hay cookie de pista del administrador? Solo comodidad visual: la autorización real
 * se comprueba siempre en el servidor, y así las páginas públicas siguen siendo estáticas.
 */
export function useAdminHint(): boolean {
  return useSyncExternalStore(subscribe, hasHint, () => false);
}
