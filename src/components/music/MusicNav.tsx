"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminHint } from "@/components/layout/useAdminHint";

const LINKS = [
  { href: "/", label: "Music" },
  { href: "/referencias", label: "References" },
  { href: "/about", label: "About" },
] as const;

/** Navegación discreta de la habitación. */
export function MusicNav() {
  const pathname = usePathname();
  const admin = useAdminHint();
  return (
    <header className="room-nav">
      <Link href="/" className="room-nav__brand" aria-label="ATWOSAINT, inicio">
        <span aria-hidden className="room-nav__dot" />
        ATWOSAINT
      </Link>
      <nav aria-label="Principal" className="room-nav__links">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
        {admin ? <Link href="/admin">Admin</Link> : null}
      </nav>
    </header>
  );
}
