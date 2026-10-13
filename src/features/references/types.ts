export type ReferenceImage = {
  /** Ruta pública o URL de la imagen. En la Fase 4 será la URL de Vercel Blob. */
  src: string;
  /** Texto alternativo; obligatorio. */
  alt: string;
  width: number;
  height: number;
};

export type Reference = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: ReferenceImage;
  /** Imagen alternativa opcional; se muestra al pasar el cursor y en la ficha. */
  hoverImage?: ReferenceImage;
  category?: string;
  sortOrder: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};
