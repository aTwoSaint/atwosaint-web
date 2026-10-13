import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <main className="px-[var(--gutter)] pt-8">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest underline-offset-8 hover:underline"
      >
        ← Referencias
      </Link>

      <article className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid gap-[var(--gutter)] sm:grid-cols-2 lg:max-w-[52rem]">
          <figure className="relative aspect-[4/5] overflow-hidden bg-line">
            <ReferenceImageView
              image={reference.image}
              sizes={sizes}
              priority
            />
          </figure>
          {reference.hoverImage ? (
            <figure className="relative aspect-[4/5] overflow-hidden bg-line">
              <ReferenceImageView
                image={reference.hoverImage}
                sizes={sizes}
              />
            </figure>
          ) : null}
        </div>

        <div className="space-y-4 lg:pt-1">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {index}
            {reference.category ? ` · ${reference.category}` : ""}
          </p>
          <h1 className="text-2xl font-medium leading-tight">
            {reference.title}
          </h1>
          <p className="leading-relaxed text-muted">{reference.description}</p>
        </div>
      </article>

      <nav
        aria-label="Referencias contiguas"
        className="mt-16 flex justify-between gap-4 border-t border-line pt-6 font-mono text-xs uppercase tracking-widest"
      >
        {prev ? (
          <Link
            href={`/referencias/${prev.slug}`}
            rel="prev"
            className="underline-offset-8 hover:underline"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/referencias/${next.slug}`}
            rel="next"
            className="text-right underline-offset-8 hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
