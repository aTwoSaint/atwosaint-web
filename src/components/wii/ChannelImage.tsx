"use client";

import { useState } from "react";
import { ReferenceImageView } from "@/components/references/ReferenceImageView";
import type { ReferenceImage } from "@/features/references/types";

type Props = {
  image: ReferenceImage;
  title: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Imagen del canal con sustituto elegante si falta o no carga (sin saltos de diseño). */
export function ChannelImage({ image, title, sizes, priority, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (!image.src || failed) {
    return (
      <span aria-hidden className="wii-channel__fallback">
        {title.trim().charAt(0).toUpperCase() || "·"}
      </span>
    );
  }
  return (
    <ReferenceImageView
      image={image}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
