import type { Beat } from "@/features/music/types";

/**
 * Contenido de DEMOSTRACIÓN de Music (demo: true), solo para desarrollo y CI (USE_SAMPLE_DATA=1).
 * La web real lee los beats de la base de datos y se gestionan desde /admin/music.
 */

const art = (n: string, alt: string) => ({ src: `/music/demo-${n}.svg`, alt, width: 800, height: 800 });

const names = ["Midnight Static", "Low Orbit", "Concrete Dreams", "Signal Lost", "Dust & Neon", "Afterglow"];
const keys = ["F# minor", "A minor", "D minor", "C minor", "G minor", "E minor"];

export const beats: Beat[] = names.map((title, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    id: `demo-${n}`,
    slug: `demo-${n}`,
    title: `${title} (demo)`,
    artist: "aTwoSaint",
    cover: art(n, `Portada de demostración ${n}.`),
    background: art(String(((i + 2) % 6) + 1).padStart(2, "0"), "Fondo de demostración."),
    audioUrl: "/music/demo-tone.wav",
    durationSeconds: 2,
    bpm: 80 + i * 6,
    musicalKey: keys[i],
    description: "Contenido de demostración. Tus beats reales se gestionan desde el panel de administración.",
    releasedOn: `2026-0${(i % 9) + 1}-1${i}`,
    buyUrl: i === 0 ? undefined : "https://traktrain.com/atwosaint",
    collection: "Demo",
    demo: true,
  };
});
