"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a,button,summary,[role=button],[data-cursor=hover]";
const TEXT_FIELD = "input,textarea,select";

/**
 * Cursor propio: mano dibujada con el índice levantado (dibujo original) + halo azul suave. Eventos de puntero y `transform`
 * (sin re-renderizar React). Solo con puntero fino; el cursor nativo se oculta
 * únicamente después del primer movimiento real, así que si algo falla sigue visible.
 */
export function WiiCursor() {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = wrap.current!;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let x = 0, y = 0, hx = 0, hy = 0, raf = 0, on = false;

    const frame = () => {
      hx += (x - hx) * (reduced ? 1 : 0.2);
      hy += (y - hy) * (reduced ? 1 : 0.2);
      halo.current!.style.transform = `translate3d(${hx}px,${hy}px,0)`;
      raf = Math.abs(x - hx) + Math.abs(y - hy) > 0.2 ? requestAnimationFrame(frame) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      dot.current!.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (!on) {
        on = true;
        hx = x;
        hy = y;
        root.classList.add("wii-cursor-on");
      }
      const target = e.target instanceof Element ? e.target : null;
      el.dataset.hover = String(Boolean(target?.closest(INTERACTIVE)));
      el.dataset.hidden = String(Boolean(target?.closest(TEXT_FIELD)));
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onDown = () => (el.dataset.down = "true");
    const onUp = () => (el.dataset.down = "false");
    const onLeave = () => (el.dataset.hidden = "true");

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      root.classList.remove("wii-cursor-on");
    };
  }, []);

  return (
    <div ref={wrap} className="wii-cursor" aria-hidden>
      <div ref={halo} className="wii-cursor__halo"><i /></div>
      <div ref={dot} className="wii-cursor__dot">
        <i>
          <svg viewBox="0 0 40 48" fill="none" aria-hidden>
            <path
              d="M10 7a4 4 0 0 1 8 0v13.5c1-1.2 3.2-1.5 4.6-.5 1.1-1 3.2-1.1 4.4.1 1.2-.8 3.1-.7 4.1.5 1.4.1 2.6 1.4 2.6 3V33c0 6-3.5 10.5-9 10.5h-5.5c-3.5 0-5.8-1.6-7.6-4.2L5.3 30.6c-1-1.5-.6-3.2.7-4 1.3-.8 3-.5 4 .8L10 28.5z"
              fill="#fff"
              stroke="#34424d"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M22.6 20v7M27 20.1v6.6M31.1 20.6v6"
              stroke="#34424d"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity=".55"
            />
          </svg>
        </i>
      </div>
    </div>
  );
}
