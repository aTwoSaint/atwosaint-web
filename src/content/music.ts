import type { Album } from "@/features/music/types";

/**
 * Contenido de DEMOSTRACIÓN de Music (demo: true), solo para desarrollo y CI (USE_SAMPLE_DATA=1).
 * La web real lee la música de la base de datos y se gestiona desde /admin/music.
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
    kind: "album",
    year: 2026,
    cover: cover("01", "Portada de demostración 01: composición de círculos concéntricos."),
    hover: cover("03", "Imagen de demostración al pasar el cursor."),
    tracks: [
      { id: "t1", title: "Pista de ejemplo 1", duration: "0:02", audioUrl: "/music/demo-tone.wav", buyUrl: "https://www.beatstars.com/" },
      { id: "t2", title: "Pista de ejemplo 2", duration: "4:17" },
      { id: "t3", title: "Pista de ejemplo 3", duration: "3:24" },
      { id: "t4", title: "Pista de ejemplo 4", duration: "4:31" },
    ],
    description:
      "Contenido de demostración. Tu música real se gestiona desde el panel de administración.",
    buyUrl: "https://www.beatstars.com/",
    demo: true,
  },
  {
    id: "demo-02",
    slug: "demo-02",
    title: "Proyecto de ejemplo 02",
    artist: "aTwoSaint (demo)",
    kind: "ep",
    year: 2026,
    cover: cover("02", "Portada de demostración 02: marco, diagonal y un sol."),
    tracks: [
      { id: "t5", title: "Pista de ejemplo 1", duration: "3:10" },
      { id: "t6", title: "Pista de ejemplo 2", duration: "4:17" },
      { id: "t7", title: "Pista de ejemplo 3", duration: "3:24" },
    ],
    description:
      "Contenido de demostración. Tu música real se gestiona desde el panel de administración.",
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
      { id: "t8", title: "Pista de ejemplo 1", duration: "3:10" },
    ],
    description:
      "Contenido de demostración. Tu música real se gestiona desde el panel de administración.",
    demo: true,
  },
  {
    id: "demo-04",
    slug: "demo-04",
    title: "Proyecto de ejemplo 04",
    artist: "aTwoSaint (demo)",
    kind: "beat_tape",
    year: 2026,
    cover: cover("04", "Portada de demostración 04: ondas y un cuadrado central."),
    tracks: [
      { id: "t9", title: "Beat de ejemplo 1", duration: "3:10" },
      { id: "t10", title: "Beat de ejemplo 2", duration: "4:17" },
      { id: "t11", title: "Beat de ejemplo 3", duration: "3:24" },
      { id: "t12", title: "Beat de ejemplo 4", duration: "4:31" },
      { id: "t13", title: "Beat de ejemplo 5", duration: "3:38" },
    ],
    description:
      "Contenido de demostración. Tu música real se gestiona desde el panel de administración.",
    demo: true,
  },
  {
    id: "demo-05",
    slug: "demo-05",
    title: "Proyecto de ejemplo 05",
    artist: "aTwoSaint (demo)",
    kind: "album",
    year: 2026,
    cover: cover("05", "Portada de demostración 05: barras de ecualizador."),
    tracks: [
      { id: "t14", title: "Pista de ejemplo 1", duration: "3:10" },
      { id: "t15", title: "Pista de ejemplo 2", duration: "4:17" },
      { id: "t16", title: "Pista de ejemplo 3", duration: "3:24" },
      { id: "t17", title: "Pista de ejemplo 4", duration: "4:31" },
      { id: "t18", title: "Pista de ejemplo 5", duration: "3:38" },
      { id: "t19", title: "Pista de ejemplo 6", duration: "4:45" },
    ],
    description:
      "Contenido de demostración. Tu música real se gestiona desde el panel de administración.",
    demo: true,
  },
  {
    id: "demo-06",
    slug: "demo-06",
    title: "Proyecto de ejemplo 06",
    artist: "aTwoSaint (demo)",
    kind: "ep",
    year: 2026,
    cover: cover("06", "Portada de demostración 06: triángulos superpuestos."),
    tracks: [
      { id: "t20", title: "Pista de ejemplo 1", duration: "3:10" },
      { id: "t21", title: "Pista de ejemplo 2", duration: "4:17" },
    ],
    description:
      "Contenido de demostración. Tu música real se gestiona desde el panel de administración.",
    demo: true,
  },
];
