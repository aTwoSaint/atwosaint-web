import Link from "next/link";
import type { Reference } from "@/features/references/types";
import { ReferenceImageView } from "./ReferenceImageView";

const SIZES = "(min-width:1536px) 25vw, (min-width:768px) 33vw, 50vw";

/**
 * Tarjeta completamente clicable. El enlace es solo el título (su nombre accesible
 * coincide con el texto visible, WCAG 2.5.3) y su pseudo-elemento cubre toda la tarjeta.
 */
export function ReferenceCard({
  reference,
  priority = false,
}: {
  reference: Reference;
  priority?: boolean;
}) {
  const index = String(reference.sortOrder).padStart(3, "0");

  return (
    <li className="group relative has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-accent">
      <figure className="relative aspect-[4/5] overflow-hidden bg-line">
        <ReferenceImageView
          image={reference.image}
          sizes={SIZES}
          priority={priority}
        />
        {reference.hoverImage ? (
          <ReferenceImageView
            image={{ ...reference.hoverImage, alt: "" }}
            sizes={SIZES}
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          />
        ) : null}
      </figure>
      <div className="mt-3 space-y-1">
        <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
          {index}
          {reference.category ? ` · ${reference.category}` : ""}
        </p>
        <h2 className="text-sm font-medium leading-snug">
          <Link
            href={`/referencias/${reference.slug}`}
            className="underline-offset-4 outline-none after:absolute after:inset-0 group-hover:underline"
          >
            {reference.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm leading-snug text-muted">
          {reference.description}
        </p>
      </div>
    </li>
  );
}
