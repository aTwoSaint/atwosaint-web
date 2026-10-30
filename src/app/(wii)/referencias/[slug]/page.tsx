import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatReferenceDate } from "@/features/menu/format";
import { ReferenceImageView } from "@/components/references/ReferenceImageView";
import {
  getAdjacentReferences,
  getReferenceBySlug,
  getReferences,
} from "@/lib/data/references";

export async function generateStaticParams() {
  const references = await getReferences();
  return references.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/referencias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const reference = await getReferenceBySlug(slug);
  if (!reference) return {};
  return {
    title: reference.title,
    description: reference.description,
  };
}

export default async function ReferencePage({
  params,
}: PageProps<"/referencias/[slug]">) {
  const { slug } = await params;
  const reference = await getReferenceBySlug(slug);
  if (!reference) notFound();

  const { prev, next } = await getAdjacentReferences(slug);
  const index = String(reference.sortOrder).padStart(3, "0");
  const sizes = "(min-width:1024px) 40vw, 100vw";
  const date = formatReferenceDate(reference.createdAt);
  const meta = [index, reference.category, date].filter(Boolean).join(" · ");

  return (
    <main className="wii-detail">
      <Link href="/" className="wii-pill">
        <span aria-hidden>←</span> Volver al menú
      </Link>

      <article className="wii-detail__card">
        <div
          className={`wii-detail__images ${reference.hoverImage ? "wii-detail__images--two" : ""}`}
        >
          <figure className="wii-detail__fig" style={{ margin: 0 }}>
            <ReferenceImageView image={reference.image} sizes={sizes} priority />
          </figure>
          {reference.hoverImage ? (
            <figure className="wii-detail__fig" style={{ margin: 0 }}>
              <ReferenceImageView image={reference.hoverImage} sizes={sizes} />
            </figure>
          ) : null}
        </div>

        <div>
          <p className="wii-detail__meta">{meta}</p>
          <h1 className="wii-detail__title">{reference.title}</h1>
          <p className="wii-detail__text">{reference.description}</p>
        </div>
      </article>

      <nav aria-label="Referencias contiguas" className="wii-detail__nav">
        {prev ? (
          <Link href={`/referencias/${prev.slug}`} rel="prev" className="wii-pill">
            <span aria-hidden>←</span> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/referencias/${next.slug}`} rel="next" className="wii-pill">
            {next.title} <span aria-hidden>→</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
