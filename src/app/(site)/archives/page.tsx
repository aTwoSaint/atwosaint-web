import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceImageView } from "@/components/references/ReferenceImageView";
import { SiteFooter } from "@/components/night/SiteFooter";
import { getReferences } from "@/lib/data/references";

export const metadata: Metadata = {
  title: "Archives",
  description: "aTwoSaint archives: visual references on fashion, photography, art, design and urban culture.",
};

/** Cada cierto número de piezas se alterna un formato (ancho, alto, grande) para una cuadrícula asimétrica. */
const SHAPES = ["", "nv-shape--tall", "", "nv-shape--wide", "", "", "nv-shape--tall", "", "nv-shape--big", ""];

export default async function ArchivesPage() {
  const references = await getReferences();
  return (
    <main className="nv-page">
      <header className="nv-pagehead">
        <h1 className="nv-pagehead__title">Archives</h1>
        <p className="nv-pagehead__sub">References, textures and ideas that shape the sound and the look.</p>
      </header>

      {references.length === 0 ? (
        <p className="nv-empty" role="status">
          The archive is empty for now.
        </p>
      ) : (
        <ul className="nv-mosaic">
          {references.map((r, i) => (
            <li key={r.id} className={`nv-tile-ref ${SHAPES[i % SHAPES.length]}`} style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
              <Link href={`/archives/${r.slug}`} className="nv-tile-ref__link">
                <span className="nv-tile-ref__media">
                  <ReferenceImageView image={r.image} sizes="(min-width:1100px) 25vw, (min-width:700px) 33vw, 50vw" priority={i < 4} />
                </span>
                <span className="nv-tile-ref__cap">
                  <span className="nv-tile-ref__title">{r.title}</span>
                  {r.category ? <span className="nv-tile-ref__cat">{r.category}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <SiteFooter />
    </main>
  );
}
