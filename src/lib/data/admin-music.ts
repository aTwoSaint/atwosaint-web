import "server-only";
import { asc, desc, eq, like, max } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/lib/db";
import { albums, images, tracks } from "@/lib/db/schema";
import { isMissingColumn } from "@/lib/data/music";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { AlbumInput } from "@/features/music/schema";

export type AdminAlbum = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  kind: "album" | "ep" | "single" | "beat_tape";
  year: number | null;
  description: string | null;
  buyUrl: string | null;
  status: "draft" | "published";
  coverUrl: string | null;
  coverAlt: string | null;
  hoverUrl: string | null;
  trackCount: number;
};

export type AdminTrack = {
  id: string;
  title: string;
  audioUrl: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number | null;
  buyUrl: string | null;
  bpm: number | null;
  musicalKey: string | null;
  description: string | null;
  releasedOn: string | null;
};

type BatchStatements = Parameters<ReturnType<typeof getDb>["batch"]>[0];

export async function listAdminAlbums(): Promise<AdminAlbum[]> {
  const db = getDb();
  const hoverImages = alias(images, "hover_images");
  const rows = await db
    .select({ album: albums, cover: images, hover: hoverImages })
    .from(albums)
    .leftJoin(images, eq(albums.coverImageId, images.id))
    .leftJoin(hoverImages, eq(albums.hoverImageId, hoverImages.id))
    .orderBy(desc(albums.sortOrder));
  const counts = await db.select({ albumId: tracks.albumId }).from(tracks);
  return rows.map(({ album: a, cover, hover }) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    artist: a.artist,
    kind: a.kind,
    year: a.year,
    description: a.description,
    buyUrl: a.buyUrl,
    status: a.status,
    coverUrl: cover?.url ?? null,
    coverAlt: cover?.alt ?? null,
    hoverUrl: hover?.url ?? null,
    trackCount: counts.filter((c) => c.albumId === a.id).length,
  }));
}

export async function getAdminAlbum(
  id: string,
): Promise<{ album: AdminAlbum; tracks: AdminTrack[] } | null> {
  const all = await listAdminAlbums();
  const album = all.find((a) => a.id === id);
  if (!album) return null;
  const db = getDb();
  type TrackRow = typeof tracks.$inferSelect;
  let rows: TrackRow[];
  try {
    rows = await db
      .select()
      .from(tracks)
      .where(eq(tracks.albumId, id))
      .orderBy(asc(tracks.position), asc(tracks.createdAt));
  } catch (error) {
    // Migración 0004 sin aplicar: el panel sigue abriendo (sin los campos nuevos) y avisa con un banner.
    if (!isMissingColumn(error)) throw error;
    const { slug: _s, bpm: _b, musicalKey: _k, description: _d, releasedOn: _r, ...legacy } = getTableColumns(tracks);
    void [_s, _b, _k, _d, _r];
    const old = await db
      .select(legacy)
      .from(tracks)
      .where(eq(tracks.albumId, id))
      .orderBy(asc(tracks.position), asc(tracks.createdAt));
    rows = old.map((t) => ({ ...t, slug: null, bpm: null, musicalKey: null, description: null, releasedOn: null }));
  }
  return {
    album,
    tracks: rows.map((t) => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audioUrl,
      mimeType: t.mimeType,
      sizeBytes: t.sizeBytes,
      durationSeconds: t.durationSeconds,
      buyUrl: t.buyUrl,
      bpm: t.bpm,
      musicalKey: t.musicalKey,
      description: t.description,
      releasedOn: t.releasedOn,
    })),
  };
}

export type NewCover = {
  url: string;
  storageKey: string;
  alt: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
};

export class SlugConflictError extends Error {}

export async function createAlbum(
  input: AlbumInput,
  cover: NewCover | null,
  hover: NewCover | null = null,
): Promise<{ id: string }> {
  const db = getDb();
  const base = slugify(input.title);
  const existing = await db.select({ slug: albums.slug }).from(albums).where(like(albums.slug, `${base}%`));
  const slug = uniqueSlug(base, existing.map((r) => r.slug));
  const [{ top }] = await db.select({ top: max(albums.sortOrder) }).from(albums);

  const id = crypto.randomUUID();
  const coverId = cover ? crypto.randomUUID() : null;
  const hoverId = hover ? crypto.randomUUID() : null;
  const statements = [
    ...(cover && coverId ? [db.insert(images).values({ id: coverId, ...cover })] : []),
    ...(hover && hoverId ? [db.insert(images).values({ id: hoverId, ...hover })] : []),
    db.insert(albums).values({
      id,
      slug,
      title: input.title,
      artist: input.artist,
      kind: input.kind,
      year: input.year ?? null,
      description: input.description ?? null,
      buyUrl: input.buyUrl ?? null,
      coverImageId: coverId,
      hoverImageId: hoverId,
      sortOrder: (top ?? 0) + 1,
      status: input.status,
    }),
  ];
  try {
    await db.batch(statements as unknown as BatchStatements);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") throw new SlugConflictError();
    throw error;
  }
  return { id };
}

/**
 * Actualiza los datos; si llegan imágenes nuevas (portada y/o hover) sustituyen a las anteriores.
 * Devuelve las URLs de los archivos sustituidos para borrarlos del almacén.
 */
export async function updateAlbum(
  id: string,
  input: AlbumInput,
  cover: NewCover | null,
  hover: NewCover | null = null,
): Promise<string[]> {
  const db = getDb();
  const [current] = await db
    .select({ coverImageId: albums.coverImageId, hoverImageId: albums.hoverImageId })
    .from(albums)
    .where(eq(albums.id, id));
  if (!current) return [];

  const values = {
    title: input.title,
    artist: input.artist,
    kind: input.kind,
    year: input.year ?? null,
    description: input.description ?? null,
    buyUrl: input.buyUrl ?? null,
    status: input.status,
    updatedAt: new Date(),
  };

  if (!cover && !hover) {
    await db.update(albums).set(values).where(eq(albums.id, id));
    return [];
  }

  const replaced: { id: string; url: string | undefined }[] = [];
  const statements = [];
  const set: Record<string, unknown> = { ...values };
  for (const [next, oldId, column] of [
    [cover, current.coverImageId, "coverImageId"],
    [hover, current.hoverImageId, "hoverImageId"],
  ] as const) {
    if (!next) continue;
    const newId = crypto.randomUUID();
    statements.push(db.insert(images).values({ id: newId, ...next }));
    set[column] = newId;
    if (oldId) {
      const [old] = await db.select({ url: images.url }).from(images).where(eq(images.id, oldId));
      replaced.push({ id: oldId, url: old?.url });
    }
  }
  statements.push(db.update(albums).set(set).where(eq(albums.id, id)));
  for (const r of replaced) statements.push(db.delete(images).where(eq(images.id, r.id)));
  await db.batch(statements as unknown as BatchStatements);
  return replaced.flatMap((r) => (r.url ? [r.url] : []));
}

export async function setAlbumStatus(id: string, status: "draft" | "published"): Promise<void> {
  await getDb().update(albums).set({ status, updatedAt: new Date() }).where(eq(albums.id, id));
}

/** Borra el proyecto, sus canciones y su portada; devuelve las URLs de todos los archivos. */
export async function deleteAlbum(id: string): Promise<string[]> {
  const db = getDb();
  const [row] = await db
    .select({ coverImageId: albums.coverImageId, hoverImageId: albums.hoverImageId })
    .from(albums)
    .where(eq(albums.id, id));
  if (!row) return [];
  const trackRows = await db.select({ url: tracks.audioUrl }).from(tracks).where(eq(tracks.albumId, id));
  const imageIds = [row.coverImageId, row.hoverImageId].filter((x): x is string => Boolean(x));
  const imageRows = await Promise.all(
    imageIds.map((iid) => db.select({ url: images.url }).from(images).where(eq(images.id, iid))),
  );

  await db.batch([
    db.delete(albums).where(eq(albums.id, id)), // las canciones caen en cascada
    ...imageIds.map((iid) => db.delete(images).where(eq(images.id, iid))),
  ] as unknown as BatchStatements);

  return [...trackRows.map((t) => t.url), ...imageRows.flatMap((r) => r.map((x) => x.url))];
}

export async function addTrack(input: {
  albumId: string;
  title: string;
  audioUrl: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number | null;
  buyUrl: string | null;
  bpm: number | null;
  musicalKey: string | null;
  description: string | null;
  releasedOn: string | null;
}): Promise<void> {
  const db = getDb();
  const [{ top }] = await db
    .select({ top: max(tracks.position) })
    .from(tracks)
    .where(eq(tracks.albumId, input.albumId));
  const taken = await db.select({ slug: tracks.slug }).from(tracks);
  const slug = uniqueSlug(
    slugify(input.title),
    taken.map((t) => t.slug).filter((x): x is string => Boolean(x)),
  );
  await db.insert(tracks).values({ ...input, slug, position: (top ?? 0) + 1 });
}

/** Edita la ficha de un beat (no toca el archivo de audio ni la dirección pública). */
export async function updateTrack(
  id: string,
  input: {
    title: string;
    buyUrl: string | null;
    bpm: number | null;
    musicalKey: string | null;
    description: string | null;
    releasedOn: string | null;
  },
): Promise<{ albumId: string } | null> {
  const db = getDb();
  const [row] = await db.update(tracks).set(input).where(eq(tracks.id, id)).returning({ albumId: tracks.albumId });
  return row ?? null;
}

/** Borra la canción; devuelve la URL del audio para limpiar el almacén. */
export async function deleteTrack(id: string): Promise<{ url: string; albumId: string } | null> {
  const db = getDb();
  const [row] = await db
    .select({ url: tracks.audioUrl, albumId: tracks.albumId })
    .from(tracks)
    .where(eq(tracks.id, id));
  if (!row) return null;
  await db.delete(tracks).where(eq(tracks.id, id));
  return row;
}
