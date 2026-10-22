import "server-only";
import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { isSampleDataMode } from "@/lib/config/env";
import { getDb } from "@/lib/db";
import { images, references } from "@/lib/db/schema";
import type { Reference, ReferenceImage } from "@/features/references/types";
import { sampleReferences } from "./sample-references";

/**
 * Única puerta de acceso a los datos públicos de Referencias.
 * Lee de PostgreSQL; con USE_SAMPLE_DATA=1 (desarrollo y CI) sirve el contenido de ejemplo.
 */

type ImageRow = typeof images.$inferSelect;

export function toReferenceImage(row: ImageRow): ReferenceImage {
  return { src: row.url, alt: row.alt, width: row.width, height: row.height };
}

export async function getReferences(): Promise<Reference[]> {
  if (isSampleDataMode()) {
    return sampleReferences
      .filter((r) => r.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const hover = alias(images, "hover_image");
  const rows = await getDb()
    .select({ reference: references, primary: images, hover })
    .from(references)
    .innerJoin(images, eq(references.primaryImageId, images.id))
    .leftJoin(hover, eq(references.hoverImageId, hover.id))
    .where(eq(references.status, "published"))
    .orderBy(asc(references.sortOrder), asc(references.createdAt));

  return rows.map(({ reference: r, primary, hover: h }) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    image: toReferenceImage(primary),
    hoverImage: h ? toReferenceImage(h) : undefined,
    category: r.category ?? undefined,
    sortOrder: r.sortOrder,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
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
