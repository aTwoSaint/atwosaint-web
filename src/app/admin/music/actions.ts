"use server";

import { randomBytes } from "node:crypto";
import { head } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getBlobEnv } from "@/lib/config/env";
import { applyUpgrades } from "@/lib/data/db-upgrade";
import {
  addTrack,
  createAlbum,
  deleteAlbum,
  deleteTrack,
  setAlbumStatus,
  updateTrack,
  SlugConflictError,
  updateAlbum,
  type NewCover,
} from "@/lib/data/admin-music";
import { ImageError, MAX_FILE_BYTES, processImage } from "@/lib/images/process";
import { deleteImages, uploadImage } from "@/lib/storage/blob";
import { isBlobUrl } from "@/features/music/links";
import {
  albumSchema,
  AUDIO_PATH_PREFIX,
  AUDIO_TYPES,
  MAX_AUDIO_BYTES,
  trackSchema,
  trackUpdateSchema,
} from "@/features/music/schema";
import { idSchema, type ActionState } from "@/features/references/schema";

function refreshPublicPages() {
  revalidatePath("/", "layout");
}

const TEXT_FIELDS = ["title", "artist", "kind", "year", "description", "buyUrl", "status"];

function readValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    TEXT_FIELDS.map((k) => [k, typeof formData.get(k) === "string" ? (formData.get(k) as string) : ""]),
  );
}

type ImageRead = { cover: NewCover | null; uploaded: string[]; error?: string };

/** Lee una imagen opcional del formulario (portada o imagen de hover), la procesa y la sube. */
async function readCover(
  formData: FormData,
  title: string,
  field = "cover",
  what = "Portada",
  folder = "musica/portadas",
): Promise<ImageRead> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return { cover: null, uploaded: [] };
  if (file.size > MAX_FILE_BYTES) return { cover: null, uploaded: [], error: `La imagen (${what.toLowerCase()}) pesa más de 4 MB.` };
  try {
    const processed = await processImage(Buffer.from(await file.arrayBuffer()));
    const stored = await uploadImage(processed.data, `${field}-${randomBytes(4).toString("hex")}`, folder);
    return {
      uploaded: [stored.url],
      cover: {
        url: stored.url,
        storageKey: stored.pathname,
        alt: `${what} de ${title}`,
        width: processed.width,
        height: processed.height,
        mimeType: processed.mimeType,
        sizeBytes: processed.sizeBytes,
      },
    };
  } catch (error) {
    if (error instanceof ImageError) return { cover: null, uploaded: [], error: error.message };
    throw error;
  }
}

function fieldErrorsOf(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

/* ───────────── Proyectos ───────────── */

export async function createAlbumAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const values = readValues(formData);
  const parsed = albumSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };

  const { cover, uploaded, error } = await readCover(formData, parsed.data.title);
  if (error) return { fieldErrors: { cover: error }, values };
  const hoverRead = await readCover(formData, parsed.data.title, "hover", "Imagen hover");
  if (hoverRead.error) {
    await deleteImages(uploaded);
    return { fieldErrors: { hover: hoverRead.error }, values };
  }

  let id: string;
  try {
    ({ id } = await createAlbum(parsed.data, cover, hoverRead.cover));
  } catch (e) {
    await deleteImages([...uploaded, ...hoverRead.uploaded]);
    console.error("Error al crear el proyecto", e);
    return {
      error:
        e instanceof SlugConflictError
          ? "Ya existe un proyecto con ese título. Inténtalo de nuevo."
          : "No se ha podido guardar. ¿Has aplicado la migración de Music en la base de datos? Inténtalo de nuevo.",
      values,
    };
  }
  refreshPublicPages();
  redirect(`/admin/music/${id}`);
}

export async function updateAlbumAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const values = readValues(formData);
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { error: "Proyecto no válido.", values };
  const parsed = albumSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };

  const { cover, uploaded, error } = await readCover(formData, parsed.data.title);
  if (error) return { fieldErrors: { cover: error }, values };
  const hoverRead = await readCover(formData, parsed.data.title, "hover", "Imagen hover");
  if (hoverRead.error) {
    await deleteImages(uploaded);
    return { fieldErrors: { hover: hoverRead.error }, values };
  }

  try {
    const replaced = await updateAlbum(id.data, parsed.data, cover, hoverRead.cover);
    if (replaced.length > 0) await deleteImages(replaced);
  } catch (e) {
    await deleteImages([...uploaded, ...hoverRead.uploaded]);
    console.error("Error al actualizar el proyecto", e);
    return { error: "No se ha podido guardar. Inténtalo de nuevo.", values };
  }
  refreshPublicPages();
  return { ok: true, values };
}

export async function toggleAlbumStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  await setAlbumStatus(id.data, formData.get("status") === "published" ? "published" : "draft");
  refreshPublicPages();
}

export async function deleteAlbumAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const urls = await deleteAlbum(id.data);
  await deleteImages(urls);
  refreshPublicPages();
  redirect("/admin/music");
}

/* ───────────── Canciones (el audio se sube directo a Blob desde el navegador) ───────────── */

export type TrackResult = { ok: true } | { ok: false; error: string };

export async function addTrackAction(input: unknown): Promise<TrackResult> {
  await requireAdmin();
  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: Object.values(fieldErrorsOf(parsed.error))[0] ?? "Datos no válidos." };
  }
  const data = parsed.data;

  // El archivo debe ser nuestro: del almacén de Blob, en la carpeta de audio y con extensión válida.
  if (!isBlobUrl(data.url) || !data.pathname.startsWith(AUDIO_PATH_PREFIX) || !/\.(mp3|wav)$/i.test(data.pathname)) {
    return { ok: false, error: "El archivo no es válido." };
  }

  try {
    const { BLOB_READ_WRITE_TOKEN } = getBlobEnv();
    const info = await head(data.url, { token: BLOB_READ_WRITE_TOKEN });
    const type = info.contentType.toLowerCase();
    if (!(AUDIO_TYPES as readonly string[]).includes(type) || info.size > MAX_AUDIO_BYTES) {
      await deleteImages([data.url]);
      return { ok: false, error: "Solo se admiten archivos mp3 o wav de hasta 80 MB." };
    }
    await addTrack({
      albumId: data.albumId,
      title: data.title,
      audioUrl: info.url,
      storageKey: info.pathname,
      mimeType: type,
      sizeBytes: info.size,
      durationSeconds: data.durationSeconds ?? null,
      buyUrl: data.buyUrl ?? null,
      bpm: data.bpm ?? null,
      musicalKey: data.musicalKey ?? null,
      description: data.description ?? null,
      releasedOn: data.releasedOn ?? null,
    });
  } catch (e) {
    console.error("Error al guardar la canción", e);
    await deleteImages([data.url]);
    return { ok: false, error: "No se ha podido guardar la canción. Inténtalo de nuevo." };
  }
  refreshPublicPages();
  return { ok: true };
}

export async function deleteTrackAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const removed = await deleteTrack(id.data);
  if (removed) await deleteImages([removed.url]);
  refreshPublicPages();
}

export async function updateTrackAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const names = ["id", "title", "buyUrl", "bpm", "musicalKey", "description", "releasedOn"];
  const values = Object.fromEntries(
    names.map((k) => [k, typeof formData.get(k) === "string" ? (formData.get(k) as string) : ""]),
  );
  const parsed = trackUpdateSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { id, ...rest } = parsed.data;
  try {
    const row = await updateTrack(id, {
      title: rest.title,
      buyUrl: rest.buyUrl ?? null,
      bpm: rest.bpm ?? null,
      musicalKey: rest.musicalKey ?? null,
      description: rest.description ?? null,
      releasedOn: rest.releasedOn ?? null,
    });
    if (!row) return { error: "El beat ya no existe.", values };
  } catch (e) {
    console.error("Error al actualizar el beat", e);
    return { error: "No se ha podido guardar. ¿Has aplicado la migración 0004 en la base de datos?", values };
  }
  refreshPublicPages();
  return { ok: true, values };
}

/** Aplica los cambios pendientes de la base de datos (idempotentes y solo aditivos). */
export async function upgradeDatabaseAction(): Promise<void> {
  await requireAdmin();
  try {
    await applyUpgrades();
  } catch (e) {
    console.error("Error al actualizar la base de datos", e);
    throw new Error("No se ha podido actualizar la base de datos. Mira el registro de Vercel.");
  }
  refreshPublicPages();
  revalidatePath("/admin/music", "layout");
}
