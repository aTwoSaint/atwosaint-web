import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cover } from "@/components/music/Cover";
import { SiteFooter } from "@/components/night/SiteFooter";
import { getBeats } from "@/lib/data/music";

export const metadata: Metadata = {
  title: "Home",
  description: "aTwoSaint — hip-hop production, sound and visual identity.",
};

export default async function HomePage() {
  const beats = await getBeats();
  const featured = beats[0];
  return (
    <main className="nv-page nv-home">
      <section className="nv-home__hero">
        <Image src="/logo-night.png" alt="aTwoSaint" width={667} height={327} priority className="nv-home__logo" />
        <h1 className="nv-home__tag">Beats. Sound. Visual identity.</h1>
        <p className="nv-home__lead">Independent hip-hop production from Spain.</p>
        <div className="nv-home__cta">
          <Link href={featured ? `/music/${featured.slug}` : "/music"} className="nv-buy">
            Listen to the beats
          </Link>
          <Link href="/archives" className="nv-ghost">
            Explore the archives
          </Link>
        </div>
      </section>

      {featured ? (
        <section className="nv-featured" aria-labelledby="featured-h">
          <h2 id="featured-h" className="nv-eyebrow">
            Featured beat
          </h2>
          <Link href={`/music/${featured.slug}`} className="nv-featured__card">
            <span className="nv-featured__art">
              <Cover image={featured.cover} title={featured.title} sizes="(min-width:700px) 220px, 40vw" />
            </span>
            <span className="nv-featured__body">
              <span className="nv-featured__title">{featured.title}</span>
              <span className="nv-featured__meta">
                {[featured.bpm ? `${featured.bpm} BPM` : null, featured.musicalKey].filter(Boolean).join(" · ") || featured.artist}
              </span>
              <span className="nv-featured__go">Listen &amp; get a license →</span>
            </span>
          </Link>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
