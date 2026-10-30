"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { clampPage, pageCount, pageSlice } from "@/features/menu/pagination";
import {
  readMenuPage,
  subscribeMenuPage,
  writeMenuPage,
} from "@/features/menu/page-store";
import type { Reference } from "@/features/references/types";
import { Channel } from "./Channel";

/**
 * Menú principal: 4 × 3 canales por página (3 columnas en tableta, 2 en móvil).
 * Solo muestra las referencias reales recibidas; no rellena huecos con contenido falso.
 */
export function ChannelMenu({ references }: { references: Reference[] }) {
  const stored = useSyncExternalStore(subscribeMenuPage, readMenuPage, () => 0);
  const pages = pageCount(references.length);
  const page = clampPage(stored, references.length);
  const go = useCallback(
    (p: number) => writeMenuPage(clampPage(p, references.length)),
    [references.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page]);

  if (references.length === 0) {
    return (
      <main className="wii-menu">
        <h1 className="sr-only">Referencias</h1>
        <div className="wii-state">
          <p>Aún no hay referencias publicadas.</p>
        </div>
      </main>
    );
  }

  const visible = pageSlice(references, page);
  const hasPrev = page > 0;
  const hasNext = page < pages - 1;

  return (
    <main className="wii-menu">
      <h1 className="sr-only">Referencias</h1>

      {pages > 1 ? (
        hasPrev ? (
          <button
            type="button"
            className="wii-arrow wii-arrow--prev"
            aria-label="Página anterior"
            onClick={() => go(page - 1)}
          >
            <span aria-hidden>‹</span>
          </button>
        ) : (
          <span className="wii-arrow-spacer" />
        )
      ) : null}

      <div className="wii-menu__center">
        <ul className="wii-grid" key={page}>
          {visible.map((reference, i) => (
            <Channel
              key={reference.id}
              reference={reference}
              index={i}
              priority={page === 0 && i < 4}
            />
          ))}
        </ul>
        {pages > 1 ? (
          <p className="wii-pager" aria-live="polite">
            <span className="sr-only">
              Página {page + 1} de {pages}
            </span>
            <span aria-hidden className="wii-dots">
              {Array.from({ length: pages }).map((_, i) => (
                <span key={i} className="wii-dot" data-active={i === page} />
              ))}
            </span>
          </p>
        ) : null}
      </div>

      {pages > 1 ? (
        hasNext ? (
          <button
            type="button"
            className="wii-arrow wii-arrow--next"
            aria-label="Página siguiente"
            onClick={() => go(page + 1)}
          >
            <span aria-hidden>›</span>
          </button>
        ) : (
          <span className="wii-arrow-spacer" />
        )
      ) : null}
    </main>
  );
}

