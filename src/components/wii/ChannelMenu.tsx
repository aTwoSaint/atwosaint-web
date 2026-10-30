"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { clampPage, PAGE_SIZE, pageCount, pageSlice } from "@/features/menu/pagination";
import {
  readMenuPage,
  subscribeMenuPage,
  writeMenuPage,
} from "@/features/menu/page-store";
import type { Reference } from "@/features/references/types";
import { Channel } from "./Channel";
import { DiscSlot, EmptySlot } from "./Slots";

type Cell = { kind: "disc" } | { kind: "ref"; reference: Reference };

/**
 * Menú principal: 4 × 3 canales por página (3 columnas en tableta, 2 en móvil).
 * Solo muestra las referencias reales recibidas; no rellena huecos con contenido falso.
 */
export function ChannelMenu({ references }: { references: Reference[] }) {
  const stored = useSyncExternalStore(subscribeMenuPage, readMenuPage, () => 0);
  // El primer hueco de la primera página está reservado al disco; el resto, a las referencias.
  const cells: Cell[] = [
    { kind: "disc" },
    ...references.map((reference): Cell => ({ kind: "ref", reference })),
  ];
  const pages = pageCount(cells.length);
  const page = clampPage(stored, cells.length);
  const go = useCallback(
    (p: number) => writeMenuPage(clampPage(p, cells.length)),
    [cells.length],
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

  const visible = pageSlice(cells, page);
  const filler = Array.from({ length: PAGE_SIZE - visible.length });
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
            <Triangle dir="left" />
          </button>
        ) : (
          <span className="wii-arrow-spacer" />
        )
      ) : null}

      <div className="wii-menu__center">
        <ul className="wii-grid" key={page}>
          {visible.map((cell, i) =>
            cell.kind === "disc" ? (
              <DiscSlot key="disc" />
            ) : (
              <Channel
                key={cell.reference.id}
                reference={cell.reference}
                index={i}
                priority={page === 0 && i < 5}
              />
            ),
          )}
          {filler.map((_, i) => (
            <EmptySlot key={`vacio-${i}`} />
          ))}
        </ul>
        {references.length === 0 ? (
          <p className="wii-pager" role="status">
            Aún no hay referencias publicadas.
          </p>
        ) : null}
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
            <Triangle dir="right" />
          </button>
        ) : (
          <span className="wii-arrow-spacer" />
        )
      ) : null}
    </main>
  );
}


function Triangle({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 32" width="26" height="34" aria-hidden style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}>
      <path
        d="M4 3.5 21 16 4 28.5z"
        fill="url(#wii-tri)"
        stroke="#2d9bd6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="wii-tri" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9eafb" />
          <stop offset="1" stopColor="#52bdf0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
