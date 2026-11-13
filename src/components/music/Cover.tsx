import Image from "next/image";
import type { AlbumImage } from "@/features/music/types";

/** Portada que rellena su contenedor. Sin imagen, un sustituto con la inicial (sin saltos de diseño). */
export function Cover({
  image,
  title,
  sizes,
  priority = false,
  eager = false,
}: {
  image?: AlbumImage;
  title: string;
  sizes: string;
  priority?: boolean;
  eager?: boolean;
}) {
  if (!image) {
    return (
      <span aria-hidden className="nv-cover__fallback">
        {title.trim().charAt(0).toUpperCase() || "·"}
      </span>
    );
  }
  return (
    <Image
      src={image.src}
      alt=""
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      loading={priority || eager ? undefined : "lazy"}
      unoptimized={image.src.endsWith(".svg")}
      className="nv-cover__img"
      draggable={false}
    />
  );
}
