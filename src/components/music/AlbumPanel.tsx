"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isBeatStarsUrl } from "@/features/music/links";
import { KIND_LABELS, type Album } from "@/features/music/types";

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function BuyLink({ url, label = "Comprar", small = false }: { url?: string; label?: string; small?: boolean }) {
  if (!url || !isBeatStarsUrl(url)) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={small ? "album-buy album-buy--small" : "album-buy"}
      aria-label={`${label} en BeatStars (se abre en una pestaña nueva)`}
    >
      {label} <span aria-hidden>↗</span>
    </a>
  );
}

/**
 * Vista detallada de un proyecto: portada, información, reproductor (mp3/wav) y botón «Comprar»
 * hacia BeatStars. Solo hay un <audio>; se detiene al cerrar.
 */
export function AlbumPanel({ album, onClose }: { album: Album; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const el = audio.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      el?.pause();
    };
  }, [onClose]);

  const playable = album.tracks
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => Boolean(t.audioUrl))
    .map(({ i }) => i);

  function play(index: number) {
    const el = audio.current;
    const track = album.tracks[index];
    if (!el || !track?.audioUrl) return;
    if (current === index) {
      if (el.paused) void el.play().catch(() => setFailed(true));
      else el.pause();
      return;
    }
    setFailed(false);
    setCurrent(index);
    setTime(0);
    el.src = track.audioUrl;
    void el.play().catch(() => setFailed(true));
  }

  function step(dir: 1 | -1) {
    if (current === null || playable.length === 0) return;
    const pos = playable.indexOf(current);
    const next = playable[(pos + dir + playable.length) % playable.length];
    play(next);
  }

  const meta = [KIND_LABELS[album.kind], album.year].filter(Boolean).join(" · ");
  const now = current !== null ? album.tracks[current] : null;

  return (
    <div className="album-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="album-title" className="album-panel">
        <button ref={closeBtn} type="button" className="album-panel__close" aria-label="Cerrar" onClick={onClose}>
          <span aria-hidden>✕</span>
        </button>

        <div className="album-panel__cover">
          {album.cover ? (
            <Image
              src={album.cover.src}
              alt={album.cover.alt}
              width={album.cover.width}
              height={album.cover.height}
              sizes="(min-width:768px) 320px, 70vw"
              unoptimized={album.cover.src.endsWith(".svg")}
              priority
            />
          ) : (
            <span aria-hidden className="album-panel__nocover">
              {album.title.trim().charAt(0).toUpperCase() || "♪"}
            </span>
          )}
        </div>

        <div className="album-panel__body">
          {album.demo ? <p className="album-panel__demo">Contenido de demostración</p> : null}
          <p className="album-panel__meta">{meta}</p>
          <h2 id="album-title" className="album-panel__title">
            {album.title}
          </h2>
          <p className="album-panel__artist">{album.artist}</p>
          {album.description ? <p className="album-panel__text">{album.description}</p> : null}

          <div className="album-panel__actions">
            <BuyLink url={album.buyUrl} />
          </div>

          <h3 className="album-panel__h">Canciones</h3>
          {album.tracks.length === 0 ? (
            <p className="album-panel__text">Aún no hay canciones.</p>
          ) : (
            <ol className="album-panel__tracks">
              {album.tracks.map((t, i) => {
                const isCurrent = current === i;
                return (
                  <li key={t.id} data-current={isCurrent}>
                    {t.audioUrl ? (
                      <button
                        type="button"
                        className="album-play"
                        aria-label={`${isCurrent && playing ? "Pausar" : "Reproducir"} ${t.title}`}
                        onClick={() => play(i)}
                      >
                        <span aria-hidden>{isCurrent && playing ? "❚❚" : "▶"}</span>
                      </button>
                    ) : (
                      <span className="album-play album-play--off" title="Sin audio todavía" aria-hidden>
                        ♪
                      </span>
                    )}
                    <span className="album-panel__name">
                      {t.title}
                      {!t.audioUrl ? <span className="sr-only"> (sin audio todavía)</span> : null}
                    </span>
                    {t.duration ? <span className="album-panel__dur">{t.duration}</span> : null}
                    <BuyLink url={t.buyUrl} small />
                  </li>
                );
              })}
            </ol>
          )}

          <div className="album-player" hidden={current === null}>
            <p className="album-player__now" aria-live="polite">
              {failed ? "No se ha podido reproducir este archivo." : now ? `Sonando: ${now.title}` : ""}
            </p>
            <div className="album-player__row">
              <button type="button" className="album-player__btn" aria-label="Canción anterior" onClick={() => step(-1)}>
                <span aria-hidden>⏮</span>
              </button>
              <button
                type="button"
                className="album-player__btn album-player__btn--main"
                aria-label={playing ? "Pausar" : "Reproducir"}
                onClick={() => current !== null && play(current)}
              >
                <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
              </button>
              <button type="button" className="album-player__btn" aria-label="Canción siguiente" onClick={() => step(1)}>
                <span aria-hidden>⏭</span>
              </button>
              <span className="album-player__time" aria-hidden>
                {clock(time)}
              </span>
              <input
                type="range"
                className="album-player__seek"
                aria-label="Posición de la canción"
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                value={Math.min(time, Math.max(duration, 1))}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTime(v);
                  if (audio.current) audio.current.currentTime = v;
                }}
              />
              <span className="album-player__time" aria-hidden>
                {clock(duration)}
              </span>
            </div>
          </div>
          <audio
            ref={audio}
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => step(1)}
            onError={() => {
              setPlaying(false);
              setFailed(true);
            }}
          />
        </div>
      </section>
    </div>
  );
}
