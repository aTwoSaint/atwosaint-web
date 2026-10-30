import Link from "next/link";
import { formatReferenceDate } from "@/features/menu/format";
import type { Reference } from "@/features/references/types";
import { ChannelImage } from "./ChannelImage";

const SIZES = "(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw";

/**
 * Un "canal": tarjeta rectangular con la imagen como protagonista.
 * El enlace es solo el título (nombre accesible = texto visible) y su pseudo-elemento
 * cubre toda la tarjeta.
 */
export function Channel({
  reference,
  index,
  priority,
}: {
  reference: Reference;
  index: number;
  priority: boolean;
}) {
  const date = formatReferenceDate(reference.createdAt);
  const meta = [reference.category, date].filter(Boolean).join(" · ");

  return (
    <li className="wii-channel" style={{ "--i": index } as React.CSSProperties}>
      <div className="wii-channel__media">
        <ChannelImage
          image={reference.image}
          title={reference.title}
          sizes={SIZES}
          priority={priority}
        />
        {reference.hoverImage ? (
          <ChannelImage
            image={{ ...reference.hoverImage, alt: "" }}
            title={reference.title}
            sizes={SIZES}
            className="wii-channel__hover"
          />
        ) : null}
      </div>
      <div className="wii-channel__body">
        {meta ? <p className="wii-channel__meta">{meta}</p> : null}
        <h2 className="wii-channel__title">
          <Link href={`/referencias/${reference.slug}`}>{reference.title}</Link>
        </h2>
        <p className="wii-channel__desc">{reference.description}</p>
      </div>
    </li>
  );
}
