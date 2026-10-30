/**
 * Página actual del menú, guardada en sessionStorage para que "volver al menú"
 * desde una ficha te deje en la misma página. Si el almacenamiento no está
 * disponible (modo privado, bloqueado) se usa memoria.
 */
const KEY = "atw_menu_page";
const listeners = new Set<() => void>();
let memory = 0;

export function readMenuPage(): number {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isInteger(n) && n >= 0) return n;
    }
  } catch {
    /* sin almacenamiento: se usa la memoria */
  }
  return memory;
}

export function writeMenuPage(page: number): void {
  memory = page;
  try {
    sessionStorage.setItem(KEY, String(page));
  } catch {
    /* ignorado */
  }
  listeners.forEach((l) => l());
}

export function subscribeMenuPage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
