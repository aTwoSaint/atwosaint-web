import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { albums as sampleAlbums } from "@/content/music";
import { isSampleDataMode } from "@/lib/config/env";
import { getDb } from "@/lib/db";
import { albums, images, tracks } from "@/lib/db/schema";
import { formatDuration } from "@/features/music/links";
import type { Album } from "@/features/music/types";

/** ¿Es el error «la tabla no existe» (migración de Music aún sin aplicar)? */
export function isMissingTable(error: unknown): boolean {
  let e: unknown = error;
  for (let i = 0; i < 4 && e; i++) {
    if ((e as { code?: string }).code === "42P01") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

/**
 * Única puerta de acceso a los datos públicos de Music.
 * Con USE_SAMPLE_DATA=1 (desarrollo y CI) sirve contenido de demostración.
 * Si la migración 0001 aún no se ha aplicado en la base de datos, devuelve una lista vacía
 * (en vez de romper la web) y lo deja en el registro.
 */
export async function getAlbums(): Promise<Album[]> {
  if (isSampleDataMode()) return sampleAlbums;

  try {
    const db = getDb();
    const rows = await db
      .select({ album: albums, cover: images })
      .from(albums)
      .leftJoin(images, eq(albums.coverImageId, images.id))
      .where(eq(albums.status, "published"))
      .orderBy(asc(albums.sortOrder), asc(albums.createdAt));
    if (rows.length === 0) return [];

    const trackRows = await db
      .select()
      .from(tracks)
      .where(inArray(tracks.albumId, rows.map((r) => r.album.id)))
      .orderBy(asc(tracks.position), asc(tracks.createdAt));

    return rows.map(({ album: a, cover }) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      artist: a.artist,
      kind: a.kind,
      year: a.year ?? undefined,
      description: a.description ?? undefined,
      buyUrl: a.buyUrl ?? undefined,
      cover: cover
        ? { src: cover.url, alt: cover.alt, width: cover.width, height: cover.height }
        : undefined,
      tracks: trackRows
        .filter((t) => t.albumId === a.id)
        .map((t) => ({
          id: t.id,
          title: t.title,
          duration: formatDuration(t.durationSeconds),
          audioUrl: t.audioUrl,
          buyUrl: t.buyUrl ?? undefined,
        })),
    }));
  } catch (error) {
    if (isMissingTable(error)) {
      console.warn("Music: faltan las tablas (aplica drizzle/0001_*.sql en Neon). Se muestra vacío.");
      return [];
    }
    throw error;
  }
}
