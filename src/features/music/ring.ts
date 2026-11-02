/** Geometría del carrusel 3D circular (ángulos en grados). */

export const FULL = 360;

export function ringStep(count: number): number {
  return count > 0 ? FULL / count : FULL;
}

/** Ángulo (sobre el eje vertical) de la portada `index` en un anillo de `count`. */
export function baseAngle(index: number, count: number): number {
  return index * ringStep(count);
}

/** Lleva cualquier ángulo al intervalo (-180, 180]. */
export function wrap180(angle: number): number {
  const a = ((((angle + 180) % FULL) + FULL) % FULL) - 180;
  return a === -180 ? 180 : a;
}

/** Cuánto hay que girar el anillo (camino más corto) para pasar de `from` a `to`. */
export function shortestDelta(from: number, to: number): number {
  return wrap180(to - from);
}

/** Ángulo del anillo que deja la portada `index` de frente al visitante. */
export function angleForIndex(index: number, count: number): number {
  return -baseAngle(index, count);
}

/** 1 = justo de frente, 0 = justo detrás. */
export function frontness(index: number, count: number, ringAngle: number): number {
  const rad = ((baseAngle(index, count) + ringAngle) * Math.PI) / 180;
  return (1 + Math.cos(rad)) / 2;
}

/** Índice de la portada más cercana al frente. */
export function frontIndex(count: number, ringAngle: number): number {
  if (count <= 0) return 0;
  let best = 0;
  let bestValue = -1;
  for (let i = 0; i < count; i++) {
    const f = frontness(i, count, ringAngle);
    if (f > bestValue) {
      bestValue = f;
      best = i;
    }
  }
  return best;
}

/** Radio del anillo para que las portadas (ancho `cardWidth`) no se solapen. */
export function ringRadius(count: number, cardWidth: number, gap = 1.28): number {
  const byPerimeter = (count * cardWidth * gap) / (2 * Math.PI);
  return Math.max(cardWidth * 2.1, byPerimeter);
}
