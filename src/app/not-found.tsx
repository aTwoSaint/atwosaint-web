import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nv-root flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="nv-eyebrow">404</p>
      <h1 className="text-2xl font-semibold">Signal lost. This page doesn’t exist.</h1>
      <Link href="/" className="nv-buy">
        Back to the menu
      </Link>
    </main>
  );
}
