import { SiteFooter } from "@/components/night/SiteFooter";

export const LEGAL_UPDATED = "13 November 2026";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="nv-page nv-prose nv-legal">
      <header className="nv-pagehead">
        <h1 className="nv-pagehead__title">{title}</h1>
        <p className="nv-pagehead__sub">Last updated: {LEGAL_UPDATED}</p>
      </header>
      <div className="nv-prose__body">{children}</div>
      <SiteFooter />
    </main>
  );
}
