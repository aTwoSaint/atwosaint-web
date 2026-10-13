import Link from "next/link";
import type { Reference } from "@/features/references/types";
import { ReferenceImageView } from "./ReferenceImageView";

const SIZES = "(min-width:1536px) 25vw, (min-width:768px) 33vw, 50vw";

export function ReferenceCard({
  reference,
  priority = false,
}: {
  reference: Reference;
  priority?: boolean;
}) {
  const index = String(reference.sortOrder).padStart(3, "0");

  return (
    <li>
      <Link
        href={`/referencias/${reference.slug}`}
        className="group block"
        aria-label={`${reference.title}. Ver referencia`}
      >
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
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          ) : null}
        </figure>
        <div className="mt-3 space-y-1">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
            {index}
            {reference.category ? ` · ${reference.category}` : ""}
          </p>
          <h2 className="text-sm font-medium leading-snug underline-offset-4 group-hover:underline">
            {reference.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-snug text-muted">
            {reference.description}
          </p>
        </div>
      </Link>
    </li>
  );
}
