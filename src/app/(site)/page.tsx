import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutIcon, ArchiveIcon, HouseIcon, MusicIcon } from "@/components/night/icons";
import { SiteFooter } from "@/components/night/SiteFooter";

export const metadata: Metadata = {
  title: { absolute: "aTwoSaint — Beats, sound & visual identity" },
  description: "aTwoSaint: independent hip-hop production, sound and visual identity. Listen to the beats and get a license.",
};

const tiles = [
  { href: "/home", title: "HOME", hint: "Start here", Icon: HouseIcon },
  { href: "/music", title: "MUSIC", hint: "Beats & licenses", Icon: MusicIcon },
  { href: "/archives", title: "ARCHIVES", hint: "Visual references", Icon: ArchiveIcon },
  { href: "/about", title: "ABOUT", hint: "The project", Icon: AboutIcon },
] as const;

/** Menú principal: cuatro recuadros grandes (en móvil, una rejilla 2 × 2). */
export default function MainMenu() {
  return (
    <main className="nv-menu-page">
      <h1 className="sr-only">aTwoSaint</h1>
      <nav aria-label="Sections" className="nv-menu">
        <Image src="/logo-night.png" alt="" width={667} height={327} priority className="nv-menu__logo" />
        <ul>
          {tiles.map(({ href, title, hint, Icon }, i) => (
            <li key={href} style={{ "--i": i } as React.CSSProperties}>
              <Link href={href} className="nv-tile">
                <Icon className="nv-tile__icon" width={56} height={56} strokeWidth={1.3} />
                <span className="nv-tile__title">{title}</span>
                <span className="nv-tile__hint">{hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <SiteFooter />
    </main>
  );
}
