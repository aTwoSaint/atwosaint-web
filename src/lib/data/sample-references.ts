import type { Reference, ReferenceImage } from "@/features/references/types";

/**
 * Contenido de EJEMPLO propio (composiciones abstractas generadas para el proyecto).
 * Se sustituye por datos reales en la Fase 4. No contiene recursos de terceros.
 */

function img(id: string, variant: "a" | "b", alt: string): ReferenceImage {
  return {
    src: `/ejemplos/ref-${id}-${variant}.svg`,
    alt,
    width: 800,
    height: 1000,
  };
}

const now = "2026-10-13T12:00:00.000Z";

const baseReferences: Reference[] = [
  {
    id: "1",
    slug: "estudio-de-forma-001",
    title: "Estudio de forma 001",
    description:
      "Exploración de volúmenes simples sobre fondo neutro. Punto de partida para la paleta de la marca.",
    image: img("001", "a", "Composición abstracta de círculos y rectángulos sobre fondo claro"),
    hoverImage: img("001", "b", "La misma composición en versión oscura"),
    category: "Estudio",
    sortOrder: 1,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2",
    slug: "estudio-de-forma-002",
    title: "Estudio de forma 002",
    description:
      "Líneas y rectángulos superpuestos con un único acento de color como señal.",
    image: img("002", "a", "Composición abstracta de líneas y rectángulos sobre fondo claro"),
    hoverImage: img("002", "b", "La misma composición en versión oscura"),
    category: "Estudio",
    sortOrder: 2,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3",
    slug: "estudio-de-forma-003",
    title: "Estudio de forma 003",
    description:
      "Ritmo y equilibrio entre vacío y masa. Prueba de composición para la cuadrícula.",
    image: img("003", "a", "Composición abstracta equilibrada sobre fondo claro"),
    hoverImage: img("003", "b", "La misma composición en versión oscura"),
    category: "Composición",
    sortOrder: 3,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "4",
    slug: "estudio-de-forma-004",
    title: "Estudio de forma 004",
    description:
      "Contraste alto con formas fragmentadas. Referencia para el tratamiento de imágenes.",
    image: img("004", "a", "Composición abstracta fragmentada sobre fondo claro"),
    hoverImage: img("004", "b", "La misma composición en versión oscura"),
    category: "Composición",
    sortOrder: 4,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "5",
    slug: "estudio-de-forma-005",
    title: "Estudio de forma 005",
    description:
      "Capas translúcidas y trazos finos. Prueba del estado sin imagen alternativa y de textos más largos en la ficha individual.",
    image: img("005", "a", "Composición abstracta de capas translúcidas sobre fondo claro"),
    category: "Estudio",
    sortOrder: 5,
    status: "published",
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Solo para pruebas (USE_SAMPLE_DATA=1): SAMPLE_COUNT=14 amplía el ejemplo con copias
 * numeradas para probar la paginación. Nunca se usa con la base de datos real.
 */
function withExtra(base: Reference[]): Reference[] {
  const wanted = Number(process.env.SAMPLE_COUNT);
  if (!Number.isInteger(wanted) || wanted <= base.length) return base;
  const extra = Array.from({ length: Math.min(wanted, 60) - base.length }, (_, i) => {
    const n = base.length + i + 1;
    const src = base[i % base.length];
    const id = String(n).padStart(3, "0");
    return {
      ...src,
      id: String(n),
      slug: `estudio-de-forma-${id}`,
      title: `Estudio de forma ${id}`,
      sortOrder: n,
    };
  });
  return [...base, ...extra];
}

export const sampleReferences: Reference[] = withExtra(baseReferences);
