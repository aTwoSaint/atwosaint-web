import type { Reference } from "@/features/references/types";
import { sampleReferences } from "./sample-references";

/**
 * Única puerta de acceso a los datos de Referencias.
 * Hoy lee contenido de ejemplo; en la Fase 4 se sustituye la implementación
 * por consultas a PostgreSQL manteniendo estas firmas, sin tocar la interfaz.
 */

export async function getReferences(): Promise<Reference[]> {
  return sampleReferences
    .filter((r) => r.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getReferenceBySlug(
  slug: string,
): Promise<Reference | null> {
  const all = await getReferences();
  return all.find((r) => r.slug === slug) ?? null;
}

export async function getAdjacentReferences(slug: string): Promise<{
  prev: Reference | null;
  next: Reference | null;
}> {
  const all = await getReferences();
  const i = all.findIndex((r) => r.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: all[i - 1] ?? null, next: all[i + 1] ?? null };
}
