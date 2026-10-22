import Link from "next/link";
import { AdminLink } from "./AdminLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="flex h-[var(--header-h)] items-center justify-between px-[var(--gutter)]">
        <Link
          href="/"
          aria-label="ATWOSAINT, inicio"
          className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em]"
        >
          <span aria-hidden className="inline-block size-2 bg-accent" />
          ATWOSAINT
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-6">
          <Link
            href="/"
            aria-current="page"
            className="font-mono text-xs uppercase tracking-widest underline-offset-8 hover:underline"
          >
            Referencias
          </Link>
          <AdminLink />
        </nav>
      </div>
    </header>
  );
}
