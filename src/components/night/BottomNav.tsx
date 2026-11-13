"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AboutIcon, ArchiveIcon, HouseIcon, MessageIcon, MusicIcon } from "./icons";

const items = [
  { href: "/home", label: "HOME", match: /^\/home(\/|$)/, Icon: HouseIcon },
  { href: "/music", label: "MUSIC", match: /^\/music(\/|$)/, Icon: MusicIcon },
  { href: "/archives", label: "ARCHIVES", match: /^\/archives(\/|$)/, Icon: ArchiveIcon },
  { href: "/about", label: "ABOUT", match: /^\/about(\/|$)/, Icon: AboutIcon },
] as const;

/**
 * Barra inferior permanente dentro de las secciones: icono de casa (menú principal) a la izquierda,
 * las cuatro secciones en el centro y el botón de contacto a la derecha. En el menú principal no aparece.
 */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const contactActive = /^\/contact(\/|$)/.test(pathname);

  return (
    <nav className="nv-bar" aria-label="Main" data-night-content>
      <Link href="/" className="nv-bar__round" aria-label="Main menu" title="Main menu">
        <span aria-hidden className="nv-bar__glyph">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
          </svg>
        </span>
      </Link>

      <ul className="nv-bar__list">
        {items.map(({ href, label, match, Icon }) => {
          const active = match.test(pathname);
          return (
            <li key={href}>
              <Link href={href} className="nv-bar__item" aria-current={active ? "page" : undefined}>
                <Icon width={20} height={20} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/contact"
        className="nv-bar__round"
        aria-label="Contact"
        title="Contact"
        aria-current={contactActive ? "page" : undefined}
      >
        <MessageIcon width={22} height={22} />
      </Link>
    </nav>
  );
}
