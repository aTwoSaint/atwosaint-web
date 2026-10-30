/** Referencias por página del menú: 4 columnas × 3 filas en escritorio. */
export const PAGE_SIZE = 12;

export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}

/** Devuelve un índice de página válido (0-based) para `total` elementos. */
export function clampPage(page: number, total: number, size = PAGE_SIZE): number {
  if (!Number.isFinite(page)) return 0;
  return Math.min(Math.max(0, Math.trunc(page)), pageCount(total, size) - 1);
}

export function pageSlice<T>(items: readonly T[], page: number, size = PAGE_SIZE): T[] {
  const p = clampPage(page, items.length, size);
  return items.slice(p * size, p * size + size);
}
