"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  angleForIndex,
  baseAngle,
  frontIndex,
  frontness,
  ringRadius,
  shortestDelta,
  wrap180,
} from "@/features/music/ring";
import { buildSlots } from "@/features/music/slots";
import { KIND_LABELS, type Album } from "@/features/music/types";
import { Triangle } from "@/components/wii/Triangle";
import { AlbumPanel } from "./AlbumPanel";

const AUTO_SPEED = -7; // grados por segundo
const TILT = -8; // inclinación del anillo (se ve ligeramente desde arriba)

/**
 * Carrusel circular en CSS 3D: las portadas flotan en un anillo que gira solo.
 * Un bucle de requestAnimationFrame actualiza solo transforms y una variable CSS (--f);
 * se detiene al pasar el cursor, al enfocar con teclado y mientras hay un álbum abierto.
 */
export function MusicRoom({ albums }: { albums: Album[] }) {
  const slots = useMemo(() => buildSlots(albums), [albums]);
  const n = slots.length;
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLUListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const openBtn = useRef<HTMLButtonElement>(null);
  const s = useRef({ angle: 0, target: null as number | null, hover: false, paused: false, idleUntil: 0, reduced: false });
  const [front, setFront] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const goTo = useCallback(
    (i: number) => {
      const st = s.current;
      st.target = wrap180(angleForIndex(i, n));
      if (st.reduced) {
        st.angle = st.target;
        st.target = null;
      }
    },
    [n],
  );

  useEffect(() => {
    const st = s.current;
    const stageEl = stage.current!;
    const ringEl = ring.current!;
    st.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastFront = -1;
    let lastAngle = NaN;
    let raf = 0;
    let prev = performance.now();

    const measure = () => {
      const w = stageEl.clientWidth;
      const h = stageEl.clientHeight;
      const card = Math.round(Math.min(Math.max(Math.min(w * 0.13, h * 0.34), 104), 210));
      stageEl.style.setProperty("--card", `${card}px`);
      stageEl.style.setProperty("--radius", `${ringRadius(n, card)}px`);
      lastAngle = NaN;
    };

    const apply = () => {
      if (st.angle === lastAngle) return;
      lastAngle = st.angle;
      ringEl.style.transform = `rotateX(${TILT}deg) rotateY(${st.angle}deg)`;
      for (let i = 0; i < n; i++) {
        const f = frontness(i, n, st.angle);
        const el = items.current[i];
        el?.style.setProperty("--f", f.toFixed(3));
        // Una portada vista de canto (ni de frente ni de espaldas) se desvanece para no parecer un fallo.
        el?.style.setProperty("--e", Math.min(1, Math.abs(2 * f - 1) * 4).toFixed(3));
      }
      const fi = frontIndex(n, st.angle);
      if (fi !== lastFront) {
        lastFront = fi;
        setFront(fi);
      }
    };

    const tick = (t: number) => {
      const dt = Math.min((t - prev) / 1000, 0.05);
      prev = t;
      if (st.target !== null) {
        const d = shortestDelta(st.angle, st.target);
        if (Math.abs(d) < 0.05) {
          st.angle = st.target;
          st.target = null;
          st.idleUntil = t + 3500;
        } else {
          st.angle = wrap180(st.angle + d * (1 - Math.exp(-dt * 6)));
        }
      } else if (!st.reduced && !st.hover && !st.paused && t >= st.idleUntil) {
        st.angle = wrap180(st.angle + AUTO_SPEED * dt);
      }
      apply();
      raf = requestAnimationFrame(tick);
    };

    measure();
    apply();
    const ro = new ResizeObserver(measure);
    ro.observe(stageEl);
    raf = requestAnimationFrame(tick);

    // Paralaje de la habitación con el cursor (solo con puntero fino y sin reducción de movimiento).
    const root = stageEl.closest<HTMLElement>(".room");
    const onMove = (e: PointerEvent) => {
      if (!root || st.reduced || e.pointerType === "touch") return;
      root.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [n]);

  const step = useCallback(
    (dir: 1 | -1) => goTo((((front + dir) % n) + n) % n),
    [front, goTo, n],
  );

  useEffect(() => {
    if (open !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const openAlbum = (i: number) => {
    goTo(i);
    s.current.paused = true;
    setOpen(i);
  };
  const close = useCallback(() => {
    s.current.paused = false;
    s.current.idleUntil = performance.now() + 2000;
    setOpen(null);
  }, []);

  if (albums.length === 0) {
    return (
      <div className="music-empty">
        <p>Aún no hay música publicada.</p>
      </div>
    );
  }

  const currentSlot = slots[front] ?? slots[0];

  return (
    <>
      <div className="music" inert={open !== null}>
        <div
          ref={stage}
          className="music-stage"
          role="region"
          aria-roledescription="carrusel"
          aria-label="Proyectos de música"
        >
          <div className="music-floorglow" aria-hidden />
          <ul ref={ring} className="music-ring">
            {slots.map((slot, i) => {
              const coverStyle = { "--a": `${baseAngle(i, n)}deg`, "--f": i === 0 ? 1 : 0, "--e": 1 } as React.CSSProperties;
              if (slot.kind === "soon") {
                return (
                  <li
                    key={slot.id}
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    className="music-cover music-cover--soon"
                    data-front={i === front}
                    aria-hidden
                    style={coverStyle}
                  >
                    <div className="music-cover__btn music-cover__soon">
                      <span className="music-cover__soon-note">♪</span>
                      <span className="music-cover__soon-text">Coming Soon</span>
                    </div>
                  </li>
                );
              }
              const album = slot.album;
              return (
                <li
                  key={album.id}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  className="music-cover"
                  data-front={i === front}
                  style={coverStyle}
                >
                  <button
                    type="button"
                    className="music-cover__btn"
                    aria-label={`Abrir ${album.title}, ${album.artist}${album.demo ? " (demostración)" : ""}`}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "touch") s.current.hover = true;
                    }}
                    onPointerLeave={() => {
                      s.current.hover = false;
                      s.current.idleUntil = performance.now() + 1200;
                    }}
                    onFocus={() => goTo(i)}
                    onClick={() => openAlbum(i)}
                  >
                    {album.cover ? (
                      <Image
                        src={album.cover.src}
                        alt=""
                        fill
                        sizes="210px"
                        unoptimized={album.cover.src.endsWith(".svg")}
                        draggable={false}
                        priority={i < 3}
                      />
                    ) : (
                      <span aria-hidden className="music-cover__fallback">
                        {album.title.trim().charAt(0).toUpperCase() || "♪"}
                      </span>
                    )}
                    {album.hover ? (
                      <Image
                        className="music-cover__hover"
                        src={album.hover.src}
                        alt=""
                        fill
                        sizes="210px"
                        unoptimized={album.hover.src.endsWith(".svg")}
                        draggable={false}
                      />
                    ) : null}
                    <span aria-hidden className="music-cover__sheen" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="music-caption">
          <button type="button" className="music-arrow" aria-label="Proyecto anterior" onClick={() => step(-1)}>
            <Triangle dir="left" />
          </button>
          <div className="music-caption__text" aria-live="polite">
            {currentSlot.kind === "soon" ? (
              <>
                <h1 className="music-caption__title music-caption__title--soon">Coming Soon</h1>
                <p className="music-caption__meta">Próximos proyectos</p>
              </>
            ) : (
              <>
                {currentSlot.album.demo ? <p className="music-caption__demo">Demostración</p> : null}
                <h1 className="music-caption__title">{currentSlot.album.title}</h1>
                <p className="music-caption__meta">
                  {currentSlot.album.artist} · {KIND_LABELS[currentSlot.album.kind]}
                </p>
                <button ref={openBtn} type="button" className="wii-pill music-open" onClick={() => openAlbum(front)}>
                  Ver detalles
                </button>
              </>
            )}
          </div>
          <button type="button" className="music-arrow" aria-label="Proyecto siguiente" onClick={() => step(1)}>
            <Triangle dir="right" />
          </button>
        </div>
      </div>

      {open !== null ? <AlbumPanel album={albums[open]} onClose={close} /> : null}
    </>
  );
}
