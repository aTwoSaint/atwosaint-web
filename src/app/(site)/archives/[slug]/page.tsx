import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReferenceImageView } from "@/components/references/ReferenceImageView";
import { SiteFooter } from "@/components/night/SiteFooter";
import { getAdjacentReferences, getReferenceBySlug, getReferences } from "@/lib/data/references";

export async function generateStaticParams() {
  const references = await getReferences();
  return references.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/archives/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const reference = await getReferenceBySlug(slug);
  if (!reference) return {};
  return { title: reference.title, description: reference.description };
}

/** Proporción de la propia imagen (sin recortarla), acotada para que ninguna ocupe una pantalla entera. */
function figureRatio(image: { width: number; height: number }): number {
  const r = image.width > 0 && image.height > 0 ? image.width / image.height : 4 / 5;
  return Math.min(1.8, Math.max(0.6, r));
}

export default async function ArchivePage({ params }: PageProps<"/archives/[slug]">) {
  const { slug } = await params;
  const reference = await getReferenceBySlug(slug);
  if (!reference) notFound();
  const { prev, next } = await getAdjacentReferences(slug);
  const sizes = "(min-width:1024px) 50vw, 100vw";
  const meta = [String(reference.sortOrder).padStart(3, "0"), reference.category].filter(Boolean).join(" · ");

  return (
    <main className="nv-page nv-detail">
      <Link href="/archives" className="nv-back">
        <span aria-hidden>←</span> Back to archives
      </Link>
      <article className="nv-detail__card">
        <div className={`nv-detail__images ${reference.hoverImage ? "nv-detail__images--two" : ""}`}>
          <figure className="nv-detail__fig" style={{ aspectRatio: figureRatio(reference.image) }}>
            <ReferenceImageView image={reference.image} sizes={sizes} priority />
          </figure>
          {reference.hoverImage ? (
            <figure className="nv-detail__fig" style={{ aspectRatio: figureRatio(reference.hoverImage) }}>
              <ReferenceImageView image={reference.hoverImage} sizes={sizes} />
            </figure>
          ) : null}
        </div>
        <div className="nv-detail__body">
          <p className="nv-eyebrow">{meta}</p>
          <h1 className="nv-detail__title">{reference.title}</h1>
          <p className="nv-detail__text">{reference.description}</p>
        </div>
      </article>
      <nav aria-label="Neighbouring references" className="nv-detail__nav">
        {prev ? (
          <Link href={`/archives/${prev.slug}`} rel="prev" className="nv-ghost">
            <span aria-hidden>←</span> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/archives/${next.slug}`} rel="next" className="nv-ghost">
            {next.title} <span aria-hidden>→</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <SiteFooter />
    </main>
  );
}
