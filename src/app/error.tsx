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
    <main className="flex flex-1 flex-col items-start justify-center gap-6 px-[var(--gutter)] py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Error
      </p>
      <h1 className="text-2xl font-medium">Algo no ha salido bien.</h1>
      <p className="max-w-md text-muted">
        No hemos podido cargar esta página. Inténtalo de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper"
      >
        Reintentar
      </button>
    </main>
  );
}
