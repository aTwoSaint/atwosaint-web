"use client";

import Link from "next/link";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useAdminHint } from "@/components/layout/useAdminHint";
import type { ContactInfo } from "@/features/contact/contact";
import { hasContact } from "@/features/contact/contact";
import { formatLongDate, formatShortDate, formatTime } from "@/features/menu/format";
import { Panel } from "./Panel";

/** Minuto actual (ms). En el servidor es 0 para no desajustar la hidratación. */
function useMinute(): number {
  return useSyncExternalStore(
    (cb) => {
      const id = window.setInterval(cb, 15_000);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0,
  );
}

type Open = null | "menu" | "contact";

/**
 * Barra inferior permanente: menú (izquierda), fecha (centro) y contacto (derecha).
 * Solo ofrece secciones y datos reales; no inventa ninguno.
 */
export function BottomBar({ contact }: { contact: ContactInfo }) {
  const [open, setOpen] = useState<Open>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const contactBtn = useRef<HTMLButtonElement>(null);
  const admin = useAdminHint();
  const minute = useMinute();
  const close = useCallback(() => setOpen(null), []);
  const now = minute ? new Date(minute) : null;

  return (
    <>
      <footer className="wii-bar" data-wii-content>
        <svg className="wii-bar__shape" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="wii-bar-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#cdd0d4" />
              <stop offset="1" stopColor="#e7e9eb" />
            </linearGradient>
          </defs>
          <path d="M0 0H100V16H80C66 16 64 62 50 62C36 62 34 16 20 16H0Z" fill="#dfe1e4" />
          <path d="M0 16H20C34 16 36 62 50 62C64 62 66 16 80 16H100V100H0Z" fill="url(#wii-bar-body)" />
          <path
            d="M0 16H20C34 16 36 62 50 62C64 62 66 16 80 16H100"
            fill="none"
            stroke="#36b3ee"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <button
          ref={menuBtn}
          type="button"
          className="wii-orb wii-orb--left"
          aria-label="Menú"
          title="Menú"
          aria-expanded={open === "menu"}
          aria-controls="panel-menu"
          aria-haspopup="dialog"
          onClick={() => setOpen(open === "menu" ? null : "menu")}
        >
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
            <path d="M4 15 16 4.5 28 15" />
            <path d="M7 13.5V27h6.5v-8h5V27H25V13.5" />
          </svg>
        </button>

        <div className="wii-bar__center">
          <p className="wii-bar__brand">ATWOSAINT</p>
          <div className="wii-date" role="timer" aria-live="off">
            {now ? (
              <>
                <span className="wii-date__day">
                  <span className="wii-date__long">{formatLongDate(now)}</span>
                  <span className="wii-date__short">{formatShortDate(now)}</span>
                </span>
                <span className="wii-date__time">{formatTime(now)}</span>
              </>
            ) : (
              <span className="wii-date__day">&nbsp;</span>
            )}
          </div>
        </div>

        <button
          ref={contactBtn}
          type="button"
          className="wii-orb wii-orb--right"
          aria-label="Contacto"
          title="Contacto"
          aria-expanded={open === "contact"}
          aria-controls="panel-contact"
          aria-haspopup="dialog"
          onClick={() => setOpen(open === "contact" ? null : "contact")}
        >
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
            <rect x="4" y="8" width="24" height="16" rx="2.5" />
            <path d="m5 10 11 8.5L27 10" />
          </svg>
        </button>
      </footer>

      {open === "menu" ? (
        <Panel id="panel-menu" title="Menú" side="left" onClose={close} trigger={menuBtn}>
          <ul className="wii-panel__list">
            <li>
              <Link href="/" className="wii-panel__link" onClick={close}>
                Menú principal · Referencias
              </Link>
            </li>
            {admin ? (
              <li>
                <Link href="/admin" className="wii-panel__link" onClick={close}>
                  Administración
                </Link>
              </li>
            ) : null}
          </ul>
          <p className="wii-panel__note">ATWOSAINT — referencias y progreso visual.</p>
        </Panel>
      ) : null}

      {open === "contact" ? (
        <Panel id="panel-contact" title="Contacto" side="right" onClose={close} trigger={contactBtn}>
          {hasContact(contact) ? (
            <ul className="wii-panel__list">
              {contact.email ? (
                <li>
                  <a className="wii-panel__link" href={`mailto:${contact.email}`}>
                    <span className="wii-panel__label">Correo</span>
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.instagram ? (
                <li>
                  <a
                    className="wii-panel__link"
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="wii-panel__label">Instagram</span>
                    Abrir perfil
                  </a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="wii-panel__note" style={{ marginTop: 0 }}>
              Todavía no hay datos de contacto publicados.
            </p>
          )}
        </Panel>
      ) : null}
    </>
  );
}
