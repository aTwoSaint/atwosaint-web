import "server-only";
import { desc, eq, like, max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { images, references } from "@/lib/db/schema";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { CreateReferenceInput } from "@/features/references/schema";

export type AdminReference = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  sortOrder: number;
  thumbUrl: string;
  thumbAlt: string;
};

export async function listAdminReferences(): Promise<AdminReference[]> {
  const rows = await getDb()
    .select({
      id: references.id,
      slug: references.slug,
      title: references.title,
      status: references.status,
      sortOrder: references.sortOrder,
      thumbUrl: images.url,
      thumbAlt: images.alt,
    })
    .from(references)
    .innerJoin(images, eq(references.primaryImageId, images.id))
    .orderBy(desc(references.sortOrder));
  return rows;
}

type NewImage = {
  url: string;
  storageKey: string;
  alt: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
};

export class SlugConflictError extends Error {}

type BatchStatements = Parameters<ReturnType<typeof getDb>["batch"]>[0];

/** Inserta imágenes y referencia en una sola transacción HTTP (db.batch). */
export async function createReference(
  input: CreateReferenceInput,
  primary: NewImage,
  hover: NewImage | null,
): Promise<{ slug: string }> {
  const db = getDb();

  const base = slugify(input.title);
  const existing = await db
    .select({ slug: references.slug })
    .from(references)
    .where(like(references.slug, `${base}%`));
  const slug = uniqueSlug(base, existing.map((r) => r.slug));

  const [{ top }] = await db
    .select({ top: max(references.sortOrder) })
    .from(references);

  const primaryId = crypto.randomUUID();
  const hoverId = hover ? crypto.randomUUID() : null;

  const statements = [
    db.insert(images).values({ id: primaryId, ...primary }),
    ...(hover && hoverId
      ? [db.insert(images).values({ id: hoverId, ...hover })]
      : []),
    db.insert(references).values({
      slug,
      title: input.title,
      description: input.description,
      category: input.category ?? null,
      primaryImageId: primaryId,
      hoverImageId: hoverId,
      sortOrder: (top ?? 0) + 1,
      status: input.status,
    }),
  ];

  try {
    await db.batch(statements as unknown as BatchStatements);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new SlugConflictError();
    }
    throw error;
  }
  return { slug };
}

export async function setReferenceStatus(
  id: string,
  status: "draft" | "published",
): Promise<void> {
  await getDb()
    .update(references)
    .set({ status, updatedAt: new Date() })
    .where(eq(references.id, id));
}

/** Borra la referencia y sus imágenes; devuelve las URLs para limpiar el almacén. */
export async function deleteReference(id: string): Promise<string[]> {
  const db = getDb();
  const [row] = await db
    .select({
      primaryImageId: references.primaryImageId,
      hoverImageId: references.hoverImageId,
    })
    .from(references)
    .where(eq(references.id, id));
  if (!row) return [];

  const imageIds = [row.primaryImageId, row.hoverImageId].filter(
    (v): v is string => Boolean(v),
  );
  const imageRows = await Promise.all(
    imageIds.map((imageId) =>
      db.select({ url: images.url }).from(images).where(eq(images.id, imageId)),
    ),
  );

  await db.batch([
    db.delete(references).where(eq(references.id, id)),
    ...imageIds.map((imageId) => db.delete(images).where(eq(images.id, imageId))),
  ] as unknown as BatchStatements);

  return imageRows.flat().map((r) => r.url);
}
