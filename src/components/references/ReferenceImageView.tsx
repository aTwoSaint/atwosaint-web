import Image from "next/image";
import type { ReferenceImage } from "@/features/references/types";

type Props = {
  image: ReferenceImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  onError?: () => void;
};

/**
 * Imagen de referencia que rellena su contenedor (la proporción la fija el contenedor) con recorte controlado.
 * Los SVG de ejemplo no pasan por el optimizador; las imágenes reales sí.
 */
export function ReferenceImageView({
  image,
  sizes,
  priority = false,
  className = "",
  onError,
}: Props) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      onError={onError}
      unoptimized={image.src.endsWith(".svg")}
      className={`absolute inset-0 size-full object-cover ${className}`}
    />
  );
}
