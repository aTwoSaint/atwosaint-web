/**
 * Los enlaces de compra solo pueden apuntar a Traktrain (https). Así un enlace mal pegado
 * o malicioso nunca acaba en la web como botón de compra.
 */
const HOSTS = [/(^|\.)traktrain\.com$/i];

/** Perfil de aTwoSaint en Traktrain: destino de reserva cuando un beat no tiene enlace propio. */
export const TRAKTRAIN_PROFILE_URL = "https://traktrain.com/atwosaint";

export function isTraktrainUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && HOSTS.some((h) => h.test(url.hostname));
  } catch {
    return false;
  }
}

/** Enlace de compra de un beat: el suyo, el de su proyecto o el perfil. Siempre devuelve un https de Traktrain. */
export function resolveBuyUrl(...candidates: Array<string | null | undefined>): string {
  for (const c of candidates) if (c && isTraktrainUrl(c)) return c;
  return TRAKTRAIN_PROFILE_URL;
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
