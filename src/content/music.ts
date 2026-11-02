import type { Album } from "@/features/music/types";

/**
 * Catálogo de Music.
 *
 * AHORA MISMO TODO ES CONTENIDO DE DEMOSTRACIÓN (demo: true): no hay música, títulos ni
 * enlaces reales. Para añadir un proyecto real, agrega un objeto a `albums` (y su portada en
 * /public/music) y quita `demo`. Los enlaces de escucha deben ser https.
 */

const cover = (n: string, alt: string) => ({
  src: `/music/demo-${n}.svg`,
  alt,
  width: 800,
  height: 800,
});

export const albums: Album[] = [
  {
    id: "demo-01",
    slug: "demo-01",
    title: "Proyecto de ejemplo 01",
    artist: "aTwoSaint (demo)",
    kind: "álbum",
    year: 2026,
    cover: cover("01", "Portada de demostración 01: composición de círculos concéntricos."),
    tracks: [
      { title: "Pista de ejemplo 1", duration: "3:10" },
      { title: "Pista de ejemplo 2", duration: "4:17" },
      { title: "Pista de ejemplo 3", duration: "3:24" },
      { title: "Pista de ejemplo 4", duration: "4:31" },
    ],
    description:
      "Contenido de demostración para probar la sala. Sustitúyelo por tu música real.",
    links: [],
    demo: true,
  },
  {
    id: "demo-02",
    slug: "demo-02",
    title: "Proyecto de ejemplo 02",
    artist: "aTwoSaint (demo)",
    kind: "EP",
    year: 2026,
    cover: cover("02", "Portada de demostración 02: marco, diagonal y un sol."),
    tracks: [
      { title: "Pista de ejemplo 1", duration: "3:10" },
      { title: "Pista de ejemplo 2", duration: "4:17" },
      { title: "Pista de ejemplo 3", duration: "3:24" },
    ],
    description:
      "Contenido de demostración para probar la sala. Sustitúyelo por tu música real.",
    links: [],
    demo: true,
  },
  {
    id: "demo-03",
    slug: "demo-03",
    title: "Proyecto de ejemplo 03",
    artist: "aTwoSaint (demo)",
    kind: "single",
    year: 2026,
    cover: cover("03", "Portada de demostración 03: colinas y luna."),
    tracks: [
      { title: "Pista de ejemplo 1", duration: "3:10" },
    ],
    description:
      "Contenido de demostración para probar la sala. Sustitúyelo por tu música real.",
    links: [],
    demo: true,
  },
  {
    id: "demo-04",
    slug: "demo-04",
    title: "Proyecto de ejemplo 04",
    artist: "aTwoSaint (demo)",
    kind: "beat tape",
    year: 2026,
    cover: cover("04", "Portada de demostración 04: ondas y un cuadrado central."),
    tracks: [
      { title: "Beat de ejemplo 1", duration: "3:10" },
      { title: "Beat de ejemplo 2", duration: "4:17" },
      { title: "Beat de ejemplo 3", duration: "3:24" },
      { title: "Beat de ejemplo 4", duration: "4:31" },
      { title: "Beat de ejemplo 5", duration: "3:38" },
    ],
    description:
      "Contenido de demostración para probar la sala. Sustitúyelo por tu música real.",
    links: [],
    demo: true,
  },
  {
    id: "demo-05",
    slug: "demo-05",
    title: "Proyecto de ejemplo 05",
    artist: "aTwoSaint (demo)",
    kind: "álbum",
    year: 2026,
    cover: cover("05", "Portada de demostración 05: barras de ecualizador."),
    tracks: [
      { title: "Pista de ejemplo 1", duration: "3:10" },
      { title: "Pista de ejemplo 2", duration: "4:17" },
      { title: "Pista de ejemplo 3", duration: "3:24" },
      { title: "Pista de ejemplo 4", duration: "4:31" },
      { title: "Pista de ejemplo 5", duration: "3:38" },
      { title: "Pista de ejemplo 6", duration: "4:45" },
    ],
    description:
      "Contenido de demostración para probar la sala. Sustitúyelo por tu música real.",
    links: [],
    demo: true,
  },
  {
    id: "demo-06",
    slug: "demo-06",
    title: "Proyecto de ejemplo 06",
    artist: "aTwoSaint (demo)",
    kind: "EP",
    year: 2026,
    cover: cover("06", "Portada de demostración 06: triángulos superpuestos."),
    tracks: [
      { title: "Pista de ejemplo 1", duration: "3:10" },
      { title: "Pista de ejemplo 2", duration: "4:17" },
    ],
    description:
      "Contenido de demostración para probar la sala. Sustitúyelo por tu música real.",
    links: [],
    demo: true,
  },
];
