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
        <div className="wii-bar__left">
          <button
            ref={menuBtn}
            type="button"
            className="wii-bar__btn"
            aria-expanded={open === "menu"}
            aria-controls="panel-menu"
            aria-haspopup="dialog"
            onClick={() => setOpen(open === "menu" ? null : "menu")}
          >
            <span aria-hidden className="wii-bar__icon" />
            Menú
          </button>
        </div>

        <div className="wii-date" role="timer" aria-live="off">
          {now ? (
            <>
              <div className="wii-date__day">
                <span className="wii-date__long">{formatLongDate(now)}</span>
                <span className="wii-date__short">{formatShortDate(now)}</span>
              </div>
              <div className="wii-date__time">{formatTime(now)}</div>
            </>
          ) : (
            <div className="wii-date__day">&nbsp;</div>
          )}
        </div>

        <div className="wii-bar__right">
          <button
            ref={contactBtn}
            type="button"
            className="wii-bar__btn"
            aria-expanded={open === "contact"}
            aria-controls="panel-contact"
            aria-haspopup="dialog"
            onClick={() => setOpen(open === "contact" ? null : "contact")}
          >
            Contacto
          </button>
        </div>
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
