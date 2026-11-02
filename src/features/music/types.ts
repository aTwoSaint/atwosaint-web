export type Track = {
  title: string;
  /** "m:ss", opcional. */
  duration?: string;
};

export type ListenLink = {
  /** Nombre de la plataforma, p. ej. "Spotify". */
  label: string;
  /** Siempre https. */
  url: string;
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  kind: "álbum" | "EP" | "single" | "beat tape";
  year?: number;
  cover: { src: string; alt: string; width: number; height: number };
  tracks: Track[];
  description?: string;
  /** Plataformas externas para escuchar. Vacío = aún sin enlaces. */
  links: ListenLink[];
  /** true = contenido de demostración, se rotula como tal en la interfaz. */
  demo?: boolean;
};
