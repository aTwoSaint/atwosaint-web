import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MusicStage } from "@/components/music/MusicStage";
import { SiteFooter } from "@/components/night/SiteFooter";
import { getBeatBySlug, getBeats } from "@/lib/data/music";

/** Los enlaces compartidos (/music/<slug>) llevan una tarjeta con la portada del beat. */
export async function generateMetadata({ params }: PageProps<"/music/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);
  if (!beat) return {};
  const detail = [beat.bpm ? `${beat.bpm} BPM` : null, beat.musicalKey].filter(Boolean).join(" · ");
  const description = `Listen to “${beat.title}” by ${beat.artist}${detail ? ` (${detail})` : ""} and get a license.`;
  const image = beat.cover && !beat.cover.src.endsWith(".svg") ? [{ url: beat.cover.src, width: beat.cover.width, height: beat.cover.height, alt: beat.title }] : undefined;
  return {
    title: beat.title,
    description,
    alternates: { canonical: `/music/${beat.slug}` },
    openGraph: { type: "music.song", title: `${beat.title} — aTwoSaint`, description, url: `/music/${beat.slug}`, images: image },
    twitter: { card: image ? "summary_large_image" : "summary", title: `${beat.title} — aTwoSaint`, description },
  };
}

export default async function BeatPage({ params }: PageProps<"/music/[slug]">) {
  const { slug } = await params;
  const beats = await getBeats();
  const beat = beats.find((b) => b.slug === slug) ?? (await getBeatBySlug(slug));
  if (!beat) notFound();
  return (
    <main className="nv-music-page">
      <MusicStage beats={beats} initialSlug={beat.slug} />
      <SiteFooter />
    </main>
  );
}
