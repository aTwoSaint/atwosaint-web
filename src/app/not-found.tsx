import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center gap-6 px-[var(--gutter)] py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-accent-ink">
        404
      </p>
      <h1 className="text-2xl font-medium">Esta página no existe.</h1>
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest underline underline-offset-8"
      >
        Volver a Referencias
      </Link>
    </main>
  );
}
