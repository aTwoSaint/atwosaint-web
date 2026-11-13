"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronIcon, ExternalIcon, PauseIcon, PlayIcon, ShareIcon } from "@/components/night/icons";
import { formatTime, useAudio, type PlayerTrack } from "@/features/audio/AudioProvider";
import { resolveBuyUrl } from "@/features/music/links";
import type { Beat } from "@/features/music/types";
import { Cover } from "./Cover";

const SWIPE_PX = 42;

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

function toTrack(b: Beat): PlayerTrack | null {
  return b.audioUrl
    ? { id: b.id, title: b.title, artist: b.artist, src: b.audioUrl, slug: b.slug, cover: b.cover?.src }
    : null;
}

/**
 * Catálogo: carrusel horizontal de portadas (una por instrumental) con su ficha, un reproductor y el botón de compra.
 * La instrumental enfocada se refleja en la URL (/music/<slug>) para poder compartirla. Nada suena sin una pulsación.
 */
export function MusicStage({ beats, initialSlug }: { beats: Beat[]; initialSlug?: string }) {
  const start = Math.max(0, initialSlug ? beats.findIndex((b) => b.slug === initialSlug) : 0);
  const [index, setIndex] = useState(start);
  const [drag, setDrag] = useState(0);
  const [note, setNote] = useState("");
  const audio = useAudio();
  const gesture = useRef<{ x: number; y: number; id: number; active: boolean } | null>(null);
  const moved = useRef(false);
  const mounted = useRef(false);

  const beat = beats[index];
  const track = useMemo(() => (beat ? toTrack(beat) : null), [beat]);
  const isCurrent = Boolean(track && audio.track?.id === track.id);
  const playing = isCurrent && audio.playing;

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(beats.length - 1, Math.max(0, next));
      setIndex((prev) => {
        if (clamped === prev) return prev;
        return clamped;
      });
    },
    [beats.length],
  );

  // Al cambiar de beat, el audio anterior se detiene (nunca suenan dos a la vez) y la URL refleja el nuevo.
  useEffect(() => {
    if (!beat) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (audio.track && audio.track.id !== beat.id) audio.stop();
    window.history.replaceState(null, "", `/music/${beat.slug}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      const interactive = t && t !== document.body && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName);
      if (e.key === "ArrowRight" && !(t?.tagName === "INPUT")) go(index + 1);
      else if (e.key === "ArrowLeft" && !(t?.tagName === "INPUT")) go(index - 1);
      else if (e.key === " " && !interactive && track) {
        e.preventDefault();
        audio.toggle(track);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, track, audio]);

  if (beats.length === 0) {
    return (
      <section className="nv-music nv-music--empty" aria-labelledby="music-title">
        <h1 id="music-title" className="nv-music__label">
          Music
        </h1>
        <p className="nv-empty">New beats are on the way.</p>
        <a className="nv-buy" href={resolveBuyUrl()} target="_blank" rel="noopener noreferrer">
          Browse the store <ExternalIcon width={18} height={18} />
        </a>
      </section>
    );
  }

  const onPointerDown = (e: React.PointerEvent) => {
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, active: false };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      g.active = true;
      (e.currentTarget as HTMLElement).setPointerCapture(g.id);
    }
    if (g.active) {
      moved.current = true;
      setDrag(dx);
    }
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.active) return;
    const dx = e.clientX - g.x;
    setDrag(0);
    if (dx <= -SWIPE_PX) go(index + 1);
    else if (dx >= SWIPE_PX) go(index - 1);
  };
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 24) go(index + (e.deltaX > 0 ? 1 : -1));
  };

  const share = async () => {
    const url = `${window.location.origin}/music/${beat.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: beat.title, text: `${beat.title} — aTwoSaint`, url });
      else {
        await navigator.clipboard.writeText(url);
        setNote("Link copied");
        window.setTimeout(() => setNote(""), 2200);
      }
    } catch {
      /* el usuario canceló */
    }
  };

  const meta = [
    beat.bpm ? { k: "BPM", v: String(beat.bpm) } : null,
    beat.musicalKey ? { k: "KEY", v: beat.musicalKey } : null,
    beat.durationSeconds ? { k: "TIME", v: formatTime(beat.durationSeconds) } : null,
    formatDate(beat.releasedOn) ? { k: "RELEASED", v: formatDate(beat.releasedOn)! } : null,
  ].filter((x): x is { k: string; v: string } => Boolean(x));

  const buyUrl = resolveBuyUrl(beat.buyUrl);
  const duration = isCurrent && audio.duration ? audio.duration : (beat.durationSeconds ?? 0);
  const position = isCurrent ? audio.current : 0;
  const bg = beat.background ?? beat.cover;

  return (
    <section className="nv-music" aria-roledescription="carousel" aria-label="Beats">
      <div className="nv-music__bg" aria-hidden>
        {bg ? (
          <Image
            key={beat.id}
            src={bg.src}
            alt=""
            fill
            sizes="100vw"
            unoptimized={bg.src.endsWith(".svg")}
            className="nv-music__bgimg"
            priority
          />
        ) : null}
      </div>

      <header className="nv-music__head">
        <h1 className="nv-music__label">Music</h1>
        <p className="nv-music__count" aria-live="polite">
          <span className="sr-only">Beat </span>
          {String(index + 1).padStart(2, "0")} / {String(beats.length).padStart(2, "0")}
        </p>
      </header>

      <div
        className="nv-reel"
        style={{ "--idx": index, "--drag": `${drag}px` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onWheel={onWheel}
        data-dragging={drag !== 0}
      >
        <button type="button" className="nv-reel__arrow nv-reel__arrow--prev" aria-label="Previous beat" disabled={index === 0} onClick={() => go(index - 1)}>
          <ChevronIcon dir="left" width={26} height={26} />
        </button>
        <ul className="nv-reel__track">
          {beats.map((b, i) => {
            const d = Math.abs(i - index);
            const active = i === index;
            const itemTrack = toTrack(b);
            const itemPlaying = Boolean(itemTrack && audio.track?.id === itemTrack.id && audio.playing);
            return (
              <li key={b.id} className="nv-card" data-d={Math.min(d, 3)} data-active={active} data-playing={itemPlaying}>
                <button
                  type="button"
                  className="nv-card__btn"
                  aria-label={active ? `${b.title}${itemTrack ? (itemPlaying ? " — pause" : " — play") : ""}` : `Select ${b.title}`}
                  aria-current={active ? "true" : undefined}
                  tabIndex={d > 1 ? -1 : 0}
                  onClick={() => {
                    if (moved.current) return;
                    if (!active) go(i);
                    else if (itemTrack) audio.toggle(itemTrack);
                  }}
                >
                  <span className="nv-card__art">
                    <Cover image={b.cover} title={b.title} sizes="(min-width:900px) 340px, 60vw" priority={i === start} eager={d <= 2} />
                    {active && itemTrack ? (
                      <span className="nv-card__play" aria-hidden>
                        {itemPlaying ? <PauseIcon width={26} height={26} /> : <PlayIcon width={26} height={26} />}
                      </span>
                    ) : null}
                    {itemPlaying ? (
                      <span className="nv-card__eq" aria-hidden>
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : null}
                  </span>
                  <span className="nv-card__name">{b.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="nv-reel__arrow nv-reel__arrow--next" aria-label="Next beat" disabled={index === beats.length - 1} onClick={() => go(index + 1)}>
          <ChevronIcon dir="right" width={26} height={26} />
        </button>
      </div>

      <div className="nv-info">
        <div className="nv-info__text">
          <h2 className="nv-info__title">{beat.title}</h2>
          <p className="nv-info__by">
            {beat.artist}
            {beat.collection && beat.collection !== beat.title ? ` · ${beat.collection}` : ""}
            {beat.demo ? " · demo" : ""}
          </p>
          {meta.length > 0 ? (
            <dl className="nv-meta">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt>{m.k}</dt>
                  <dd>{m.v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {beat.description ? <p className="nv-info__desc">{beat.description}</p> : null}
        </div>

        <div className="nv-player" role="group" aria-label={`Player — ${beat.title}`}>
          <button
            type="button"
            className="nv-player__play"
            disabled={!track}
            aria-label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
            onClick={() => track && audio.toggle(track)}
          >
            {playing ? <PauseIcon width={26} height={26} /> : <PlayIcon width={26} height={26} />}
          </button>
          <div className="nv-player__bar">
            <input
              type="range"
              className="nv-player__range"
              min={0}
              max={Math.max(1, Math.floor(duration))}
              step={1}
              value={Math.min(Math.floor(position), Math.max(1, Math.floor(duration)))}
              disabled={!isCurrent || !duration}
              aria-label="Seek"
              aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
              style={{ "--p": duration ? `${Math.min(100, (position / duration) * 100)}%` : "0%" } as React.CSSProperties}
              onChange={(e) => audio.seek(Number(e.target.value))}
            />
            <p className="nv-player__time">
              <span>{formatTime(position)}</span>
              <span className="nv-player__status" role="status">
                {!track ? "Preview not available" : isCurrent && audio.error ? "Couldn’t load the audio" : isCurrent && audio.loading ? "Loading…" : playing ? "Now playing" : ""}
              </span>
              <span>{duration ? formatTime(duration) : "–:––"}</span>
            </p>
          </div>
        </div>

        <div className="nv-actions">
          <a
            className="nv-buy"
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`BUY BEAT — ${beat.title} on Traktrain (opens in a new tab)`}
          >
            BUY BEAT <ExternalIcon width={18} height={18} />
          </a>
          <button type="button" className="nv-ghost" onClick={share} aria-label={`Share ${beat.title}`}>
            <ShareIcon width={18} height={18} />
            <span>{note || "Share"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
