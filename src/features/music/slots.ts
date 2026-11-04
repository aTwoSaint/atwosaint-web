import type { Album } from "./types";

/** Con menos proyectos que esto, el anillo se completa con huecos «Coming Soon». */
export const MIN_SLOTS = 6;

export type Slot = { kind: "album"; album: Album } | { kind: "soon"; id: string };

/**
 * Lista de huecos del carrusel: los proyectos reales primero (mismo índice que en `albums`)
 * y, si hay pocos, huecos grises «Coming Soon» hasta completar el anillo.
 * Sin ningún proyecto no se añade nada (la página muestra su estado vacío).
 */
export function buildSlots(albums: Album[], min: number = MIN_SLOTS): Slot[] {
  const slots: Slot[] = albums.map((album) => ({ kind: "album", album }));
  if (albums.length === 0) return slots;
  for (let i = albums.length; i < min; i++) slots.push({ kind: "soon", id: `soon-${i}` });
  return slots;
}
