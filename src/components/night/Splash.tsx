"use client";

import Image from "next/image";
import { useEffect } from "react";
import { SPLASH_MS } from "@/content/site";

const STORAGE_KEY = "atw_intro_seen";
const root = () => document.documentElement;

function setInert(value: boolean) {
  document.querySelectorAll<HTMLElement>("[data-night-content]").forEach((el) => {
    el.inert = value;
  });
}

/**
 * Pantalla de bienvenida automática. El estado vive en `<html data-intro>` (lo fija un script en línea
 * antes de pintar): "active" → visible; "leaving" → difuminado; "seen" → no se muestra.
 * No requiere clic: se retira sola tras SPLASH_MS. Un toque o una tecla la saltan.
 * Con «reducir movimiento», sin JavaScript o al aterrizar en otra página, no aparece.
 */
export function Splash() {
  useEffect(() => {
    if (root().dataset.intro !== "active") return;
    setInert(true);
    const finish = () => leave();
    const timer = window.setTimeout(finish, SPLASH_MS);
    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
      setInert(false);
    };
  }, []);

  return (
    <div className="nv-splash" aria-hidden="true">
      <Image src="/logo-night.png" alt="" width={667} height={327} priority className="nv-splash__logo" />
    </div>
  );
}

function leave() {
  if (root().dataset.intro !== "active") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* sin almacenamiento: la intro volverá a salir al recargar, nada más */
  }
  root().dataset.intro = "leaving";
  setInert(false);
  window.setTimeout(() => {
    root().dataset.intro = "seen";
  }, 800);
}

/**
 * Script mínimo que se ejecuta antes de pintar: decide si toca la intro (solo al aterrizar en "/" en una
 * sesión nueva y sin «reducir movimiento»). Sin datos de usuario ni secretos.
 */
const code = `try{var d=document.documentElement,r=matchMedia("(prefers-reduced-motion: reduce)").matches;d.dataset.intro=(location.pathname==="/"&&!r&&!sessionStorage.getItem("${STORAGE_KEY}"))?"active":"seen"}catch(e){document.documentElement.dataset.intro="seen"}`;

export function SplashScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
