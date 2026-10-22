import "server-only";
import { del, put } from "@vercel/blob";
import { getBlobEnv } from "@/lib/config/env";

export type StoredFile = { url: string; pathname: string };

/** Sube una imagen ya procesada. El nombre lleva un sufijo aleatorio para no ser adivinable. */
export async function uploadImage(
  data: Buffer,
  baseName: string,
): Promise<StoredFile> {
  const { BLOB_READ_WRITE_TOKEN } = getBlobEnv();
  const result = await put(`referencias/${baseName}.webp`, data, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: true,
    token: BLOB_READ_WRITE_TOKEN,
  });
  return { url: result.url, pathname: result.pathname };
}

/** Borrado de mejor esfuerzo: un archivo huérfano no debe romper la operación principal. */
export async function deleteImages(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    const { BLOB_READ_WRITE_TOKEN } = getBlobEnv();
    await del(urls, { token: BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error("No se pudieron borrar archivos del almacén", error);
  }
}
