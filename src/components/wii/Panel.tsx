"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

type Props = {
  id: string;
  title: string;
  side: "left" | "right";
  onClose: () => void;
  /** Botón que lo abre: no cuenta como "clic fuera" y recupera el foco al cerrar. */
  trigger: RefObject<HTMLElement | null>;
  children: ReactNode;
};

/** Panel emergente no modal: se cierra con Escape, con la X o haciendo clic fuera. */
export function Panel({ id, title, side, onClose, trigger, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = trigger.current;
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || opener?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      opener?.focus();
    };
  }, [onClose, trigger]);

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={`${id}-title`}
      className={`wii-panel wii-panel--${side}`}
    >
      <div className="wii-panel__head">
        <h2 id={`${id}-title`} className="wii-panel__title">{title}</h2>
        <button
          ref={closeBtn}
          type="button"
          className="wii-panel__close"
          aria-label={`Cerrar ${title.toLowerCase()}`}
          onClick={onClose}
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
      {children}
    </div>
  );
}
