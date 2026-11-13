"use client";

import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Sin detalles técnicos en pantalla; el error queda en la consola/servidor.
    console.error(error);
  }, [error]);

  return (
    <main className="nv-root flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="nv-eyebrow">Error</p>
      <h1 className="text-2xl font-semibold">Something went wrong.</h1>
      <p className="max-w-md text-[var(--n-grey)]">We couldn’t load this page. Try again in a few seconds.</p>
      <button type="button" onClick={() => retry()} className="nv-buy">
        Try again
      </button>
    </main>
  );
}
