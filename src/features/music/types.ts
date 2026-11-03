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
  /** Enlace de compra propio de la canción (BeatStars). */
  buyUrl?: string;
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  kind: MusicKind;
  year?: number;
  /** Sin portada se muestra un sustituto con la inicial del título. */
  cover?: { src: string; alt: string; width: number; height: number };
  tracks: Track[];
  description?: string;
  /** Enlace de compra del proyecto (BeatStars). */
  buyUrl?: string;
  /** true = contenido de demostración (solo modo de ejemplo / CI). */
  demo?: boolean;
};
