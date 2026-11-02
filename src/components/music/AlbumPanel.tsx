"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Album } from "@/features/music/types";

/** Vista detallada de un proyecto: portada, información, canciones y enlaces de escucha. */
export function AlbumPanel({ album, onClose }: { album: Album; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const meta = [album.kind, album.year].filter(Boolean).join(" · ");

  return (
    <div className="album-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="album-title" className="album-panel">
        <button ref={closeBtn} type="button" className="album-panel__close" aria-label="Cerrar" onClick={onClose}>
          <span aria-hidden>✕</span>
        </button>

        <div className="album-panel__cover">
          <Image
            src={album.cover.src}
            alt={album.cover.alt}
            width={album.cover.width}
            height={album.cover.height}
            sizes="(min-width:768px) 320px, 70vw"
            unoptimized={album.cover.src.endsWith(".svg")}
            priority
          />
        </div>

        <div className="album-panel__body">
          {album.demo ? <p className="album-panel__demo">Contenido de demostración</p> : null}
          <p className="album-panel__meta">{meta}</p>
          <h2 id="album-title" className="album-panel__title">{album.title}</h2>
          <p className="album-panel__artist">{album.artist}</p>
          {album.description ? <p className="album-panel__text">{album.description}</p> : null}

          {album.tracks.length > 0 ? (
            <>
              <h3 className="album-panel__h">Canciones</h3>
              <ol className="album-panel__tracks">
                {album.tracks.map((t, i) => (
                  <li key={`${t.title}-${i}`}>
                    <span>{t.title}</span>
                    {t.duration ? <span className="album-panel__dur">{t.duration}</span> : null}
                  </li>
                ))}
              </ol>
            </>
          ) : null}

          <h3 className="album-panel__h">Escuchar</h3>
          {album.links.length > 0 ? (
            <ul className="album-panel__links">
              {album.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="album-panel__text">Aún no hay enlaces de escucha.</p>
          )}
        </div>
      </section>
    </div>
  );
}
