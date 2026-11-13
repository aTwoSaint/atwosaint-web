export type MusicKind = "album" | "ep" | "single" | "beat_tape";

export const KIND_LABELS: Record<MusicKind, string> = {
  album: "Álbum",
  ep: "EP",
  single: "Single",
  beat_tape: "Beat tape",
};

export type Track = {
  id: string;
  title: string;
  /** "m:ss", opcional. */
  duration?: string;
  /** Archivo mp3/wav. Sin audio, la canción se lista pero no se puede reproducir. */
  audioUrl?: string;
  /** Enlace de compra propio de la canción (Traktrain). */
  buyUrl?: string;
};

export type AlbumImage = { src: string; alt: string; width: number; height: number };

export type Album = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  kind: MusicKind;
  year?: number;
  /** Sin portada se muestra un sustituto con la inicial del título. */
  cover?: AlbumImage;
  /** Imagen que sustituye a la portada al pasar el cursor (la sube el administrador). */
  hover?: AlbumImage;
  tracks: Track[];
  description?: string;
  /** Enlace de compra del proyecto (Traktrain). */
  buyUrl?: string;
  /** true = contenido de demostración (solo modo de ejemplo / CI). */
  demo?: boolean;
};

/**
 * Una instrumental publicada: es lo que se muestra como una tarjeta del carrusel y tiene su propia
 * página (/music/<slug>). Hereda portada e imagen de fondo del proyecto al que pertenece.
 */
export type Beat = {
  id: string;
  /** Dirección pública. Las canciones antiguas sin slug usan su id. */
  slug: string;
  title: string;
  artist: string;
  cover?: AlbumImage;
  /** Imagen que sustituye al fondo de la página al enfocar el beat. */
  background?: AlbumImage;
  /** Archivo mp3/wav (vista previa). Sin audio no se puede reproducir. */
  audioUrl?: string;
  durationSeconds?: number;
  bpm?: number;
  musicalKey?: string;
  description?: string;
  /** AAAA-MM-DD */
  releasedOn?: string;
  /** Enlace https de Traktrain de este beat; si falta, se usa el del proyecto o el perfil. */
  buyUrl?: string;
  /** Proyecto al que pertenece (solo informativo). */
  collection?: string;
  /** true = contenido de demostración (solo modo de ejemplo / CI). */
  demo?: boolean;
};
