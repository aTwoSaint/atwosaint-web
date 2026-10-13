import Image from "next/image";
import type { ReferenceImage } from "@/features/references/types";

type Props = {
  image: ReferenceImage;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Imagen de referencia con proporción fija 4:5 y recorte controlado.
 * Los SVG de ejemplo no pasan por el optimizador; las imágenes reales sí.
 */
export function ReferenceImageView({
  image,
  sizes,
  priority = false,
  className = "",
}: Props) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      unoptimized={image.src.endsWith(".svg")}
      className={`absolute inset-0 size-full object-cover ${className}`}
    />
  );
}
