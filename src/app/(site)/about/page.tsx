import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/night/SiteFooter";
import { about } from "@/content/about";

export const metadata: Metadata = {
  title: "About",
  description: "aTwoSaint is an independent creative project based in Spain, focused on hip-hop production, sound and visual identity.",
};

export default function AboutPage() {
  return (
    <main className="nv-page nv-prose">
      <header className="nv-pagehead">
        <h1 className="nv-pagehead__title">{about.title}</h1>
      </header>
      <div className="nv-prose__body">
        <p className="nv-prose__lead">{about.lead}</p>
        {about.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="nv-prose__sign">{about.signature}</p>
        <p>
          <Link href="/music" className="nv-buy">
            Listen to the beats
          </Link>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
