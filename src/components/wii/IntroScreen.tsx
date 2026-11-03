"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const STORAGE_KEY = "atw_intro_seen";
const root = () => document.documentElement;

function setInert(value: boolean) {
  document.querySelectorAll<HTMLElement>("[data-wii-content]").forEach((el) => {
    el.inert = value;
  });
}

/**
 * Pantalla de bienvenida. El estado vive en `<html data-intro>` (lo fija un script en línea
 * antes de pintar): "active" → visible; "leaving" → transición; "seen" → no se muestra.
 * Es un <button> a pantalla completa: clic, Enter y Espacio entran de forma nativa.
 * Sin JS (o si algo falla) el script no activa la intro y el menú queda visible.
 */
export function IntroScreen() {
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (root().dataset.intro !== "active") return;
    setInert(true);
    button.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (root().dataset.intro !== "active") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setInert(false);
    };
  }, []);

  return (
    <button
      ref={button}
      type="button"
      className="wii-intro"
      onClick={enter}
    >
      <Image
        src="/logo.png"
        alt="ATWOSAINT"
        width={667}
        height={327}
        priority
        className="wii-intro__logo"
      />
      <span className="wii-intro__hint">
        Haz clic para entrar
      </span>
    </button>
  );
}

function enter() {
  if (root().dataset.intro !== "active") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* sin almacenamiento: la intro volverá a salir al recargar, nada más */
  }
  root().dataset.intro = "leaving";
  setInert(false);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    root().dataset.intro = "seen";
  }, reduced ? 30 : 900);
}
