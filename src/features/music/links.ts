/**
 * Los enlaces de compra solo pueden apuntar a BeatStars (https). Así un enlace mal pegado
 * o malicioso nunca acaba en la web como botón «Comprar».
 */
const HOSTS = [/(^|\.)beatstars\.com$/i, /^bsta\.rs$/i];

export function isBeatStarsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && HOSTS.some((h) => h.test(url.hostname));
  } catch {
    return false;
  }
}

/** Almacén de archivos permitido para audio y portadas: solo nuestro Vercel Blob. */
export function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /\.public\.blob\.vercel-storage\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function formatDuration(seconds: number | null | undefined): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return undefined;
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
