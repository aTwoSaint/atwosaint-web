import "server-only";
import { asc, eq, getTableColumns, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { beats as sampleBeats } from "@/content/music";
import { isSampleDataMode } from "@/lib/config/env";
import { getDb } from "@/lib/db";
import { albums, images, tracks } from "@/lib/db/schema";
import type { Beat } from "@/features/music/types";

/** ¿Es el error «la tabla no existe» (migración de Music aún sin aplicar)? */
export function isMissingTable(error: unknown): boolean {
  let e: unknown = error;
  for (let i = 0; i < 4 && e; i++) {
    if ((e as { code?: string }).code === "42P01") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

/** ¿Es el error «la columna no existe» (migración aún sin aplicar)? */
export function isMissingColumn(error: unknown): boolean {
  let e: unknown = error;
  for (let i = 0; i < 4 && e; i++) {
    if ((e as { code?: string }).code === "42703") return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Única puerta de acceso a los beats públicos (cada canción de un proyecto publicado).
 * Con USE_SAMPLE_DATA=1 (desarrollo y CI) sirve contenido de demostración.
 * Si faltan migraciones (0001 tablas, 0002 hover, 0004 ficha del beat), la web sigue funcionando
 * con lo que haya y lo deja en el registro.
 */
export async function getBeats(): Promise<Beat[]> {
  if (isSampleDataMode()) {
    // SAMPLE_MUSIC_COUNT permite probar el carrusel con pocos beats (p. ej. 1).
    const n = Number(process.env.SAMPLE_MUSIC_COUNT);
    return Number.isInteger(n) && n >= 0 ? sampleBeats.slice(0, n) : sampleBeats;
  }

  try {
    const db = getDb();
    const hoverImages = alias(images, "hover_images");
    const base = db
      .select({ album: albums, cover: images, hover: hoverImages })
      .from(albums)
      .leftJoin(images, eq(albums.coverImageId, images.id))
      .leftJoin(hoverImages, eq(albums.hoverImageId, hoverImages.id))
      .where(eq(albums.status, "published"))
      .orderBy(asc(albums.sortOrder), asc(albums.createdAt));
    let rows: Awaited<typeof base>;
    try {
      rows = await base;
    } catch (error) {
      if (!isMissingColumn(error)) throw error;
      // La migración 0002 (imagen de hover) aún no está aplicada: se sirve la música sin ella.
      console.warn("Music: falta la columna hover_image_id (aplica drizzle/0002_*.sql en Neon).");
      const { hoverImageId: _omit, ...legacy } = getTableColumns(albums);
      void _omit;
      const old = await db
        .select({ album: legacy, cover: images })
        .from(albums)
        .leftJoin(images, eq(albums.coverImageId, images.id))
        .where(eq(albums.status, "published"))
        .orderBy(asc(albums.sortOrder), asc(albums.createdAt));
      rows = old.map((r) => ({ album: { ...r.album, hoverImageId: null }, cover: r.cover, hover: null }));
    }
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.album.id);
    type TrackRow = typeof tracks.$inferSelect;
    let trackRows: TrackRow[];
    try {
      trackRows = await db
        .select()
        .from(tracks)
        .where(inArray(tracks.albumId, ids))
        .orderBy(asc(tracks.position), asc(tracks.createdAt));
    } catch (error) {
      if (!isMissingColumn(error)) throw error;
      // La migración 0004 (ficha del beat) aún no está aplicada: se sirven los beats sin esos campos.
      console.warn("Music: faltan columnas de la ficha del beat (aplica drizzle/0004_beat_details.sql en Neon).");
      const { slug: _s, bpm: _b, musicalKey: _k, description: _d, releasedOn: _r, ...legacy } = getTableColumns(tracks);
      void [_s, _b, _k, _d, _r];
      const old = await db
        .select(legacy)
        .from(tracks)
        .where(inArray(tracks.albumId, ids))
        .orderBy(asc(tracks.position), asc(tracks.createdAt));
      trackRows = old.map((t) => ({ ...t, slug: null, bpm: null, musicalKey: null, description: null, releasedOn: null }));
    }

    const out: Beat[] = [];
    for (const { album: a, cover, hover } of rows) {
      const image = (i: typeof cover) =>
        i ? { src: i.url, alt: i.alt, width: i.width, height: i.height } : undefined;
      for (const t of trackRows.filter((x) => x.albumId === a.id)) {
        out.push({
          id: t.id,
          slug: t.slug ?? t.id,
          title: t.title,
          artist: a.artist,
          cover: image(cover),
          background: image(hover),
          audioUrl: t.audioUrl,
          durationSeconds: t.durationSeconds ?? undefined,
          bpm: t.bpm ?? undefined,
          musicalKey: t.musicalKey ?? undefined,
          description: t.description ?? a.description ?? undefined,
          releasedOn: t.releasedOn ?? undefined,
          buyUrl: t.buyUrl ?? a.buyUrl ?? undefined,
          collection: a.title,
        });
      }
    }
    return out;
  } catch (error) {
    if (isMissingTable(error)) {
      console.warn("Music: faltan las tablas (aplica drizzle/0001_*.sql en Neon). Se muestra vacío.");
      return [];
    }
    throw error;
  }
}

export async function getBeatBySlug(slug: string): Promise<Beat | null> {
  const all = await getBeats();
  return all.find((b) => b.slug === slug) ?? (UUID.test(slug) ? all.find((b) => b.id === slug) ?? null : null);
}
