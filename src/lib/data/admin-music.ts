import "server-only";
import { asc, desc, eq, like, max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { albums, images, tracks } from "@/lib/db/schema";
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
};

type BatchStatements = Parameters<ReturnType<typeof getDb>["batch"]>[0];

export async function listAdminAlbums(): Promise<AdminAlbum[]> {
  const db = getDb();
  const rows = await db
    .select({ album: albums, cover: images })
    .from(albums)
    .leftJoin(images, eq(albums.coverImageId, images.id))
    .orderBy(desc(albums.sortOrder));
  const counts = await db.select({ albumId: tracks.albumId }).from(tracks);
  return rows.map(({ album: a, cover }) => ({
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
    trackCount: counts.filter((c) => c.albumId === a.id).length,
  }));
}

export async function getAdminAlbum(
  id: string,
): Promise<{ album: AdminAlbum; tracks: AdminTrack[] } | null> {
  const all = await listAdminAlbums();
  const album = all.find((a) => a.id === id);
  if (!album) return null;
  const rows = await getDb()
    .select()
    .from(tracks)
    .where(eq(tracks.albumId, id))
    .orderBy(asc(tracks.position), asc(tracks.createdAt));
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

export async function createAlbum(input: AlbumInput, cover: NewCover | null): Promise<{ id: string }> {
  const db = getDb();
  const base = slugify(input.title);
  const existing = await db.select({ slug: albums.slug }).from(albums).where(like(albums.slug, `${base}%`));
  const slug = uniqueSlug(base, existing.map((r) => r.slug));
  const [{ top }] = await db.select({ top: max(albums.sortOrder) }).from(albums);

  const id = crypto.randomUUID();
  const coverId = cover ? crypto.randomUUID() : null;
  const statements = [
    ...(cover && coverId ? [db.insert(images).values({ id: coverId, ...cover })] : []),
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

/** Actualiza los datos; si llega una portada nueva, sustituye la anterior y devuelve su URL para borrarla. */
export async function updateAlbum(id: string, input: AlbumInput, cover: NewCover | null): Promise<string | null> {
  const db = getDb();
  const [current] = await db
    .select({ coverImageId: albums.coverImageId })
    .from(albums)
    .where(eq(albums.id, id));
  if (!current) return null;

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

  if (!cover) {
    await db.update(albums).set(values).where(eq(albums.id, id));
    return null;
  }

  const oldId = current.coverImageId;
  const [old] = oldId ? await db.select({ url: images.url }).from(images).where(eq(images.id, oldId)) : [];
  const newId = crypto.randomUUID();
  await db.batch([
    db.insert(images).values({ id: newId, ...cover }),
    db.update(albums).set({ ...values, coverImageId: newId }).where(eq(albums.id, id)),
    ...(oldId ? [db.delete(images).where(eq(images.id, oldId))] : []),
  ] as unknown as BatchStatements);
  return old?.url ?? null;
}

export async function setAlbumStatus(id: string, status: "draft" | "published"): Promise<void> {
  await getDb().update(albums).set({ status, updatedAt: new Date() }).where(eq(albums.id, id));
}

/** Borra el proyecto, sus canciones y su portada; devuelve las URLs de todos los archivos. */
export async function deleteAlbum(id: string): Promise<string[]> {
  const db = getDb();
  const [row] = await db
    .select({ coverImageId: albums.coverImageId })
    .from(albums)
    .where(eq(albums.id, id));
  if (!row) return [];
  const trackRows = await db.select({ url: tracks.audioUrl }).from(tracks).where(eq(tracks.albumId, id));
  const [cover] = row.coverImageId
    ? await db.select({ url: images.url }).from(images).where(eq(images.id, row.coverImageId))
    : [];

  await db.batch([
    db.delete(albums).where(eq(albums.id, id)), // las canciones caen en cascada
    ...(row.coverImageId ? [db.delete(images).where(eq(images.id, row.coverImageId))] : []),
  ] as unknown as BatchStatements);

  return [...trackRows.map((t) => t.url), ...(cover ? [cover.url] : [])];
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
}): Promise<void> {
  const db = getDb();
  const [{ top }] = await db
    .select({ top: max(tracks.position) })
    .from(tracks)
    .where(eq(tracks.albumId, input.albumId));
  await db.insert(tracks).values({ ...input, position: (top ?? 0) + 1 });
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
