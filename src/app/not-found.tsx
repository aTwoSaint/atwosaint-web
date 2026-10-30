import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wii-stage flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--w-blue-ink)]">
        404
      </p>
      <h1 className="text-2xl font-semibold">Esta página no existe.</h1>
      <Link href="/" className="wii-pill">
        <span aria-hidden>←</span> Volver al menú
      </Link>
    </main>
  );
}
