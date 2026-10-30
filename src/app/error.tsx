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
    <main className="wii-stage flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--w-blue-ink)]">
        Error
      </p>
      <h1 className="text-2xl font-semibold">Algo no ha salido bien.</h1>
      <p className="max-w-md text-[var(--w-muted)]">
        No hemos podido cargar las referencias. Inténtalo de nuevo en unos segundos.
      </p>
      <button type="button" onClick={() => retry()} className="wii-pill">
        Reintentar
      </button>
    </main>
  );
}
