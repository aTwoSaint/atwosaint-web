import sharp from "sharp";

/** Límites. Vercel admite ~4,5 MB por petición, así que las dos imágenes juntas deben caber. */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 4.2 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

export class ImageError extends Error {}

export type ProcessedImage = {
  data: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
  sizeBytes: number;
};

/**
 * Valida por el contenido real (no por la extensión ni el tipo declarado), corrige la
 * orientación, elimina los metadatos EXIF (ubicación, cámara…) y recomprime a WebP.
 * Los SVG y cualquier otro formato se rechazan.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  if (input.length === 0) throw new ImageError("El archivo está vacío.");
  if (input.length > MAX_FILE_BYTES) {
    throw new ImageError("La imagen pesa más de 4 MB.");
  }

  try {
    const image = sharp(input, {
      limitInputPixels: MAX_INPUT_PIXELS,
      failOn: "error",
    });
    const meta = await image.metadata();
    if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
      throw new ImageError("Formato no admitido. Usa JPG, PNG, WebP o AVIF.");
    }
    const { data, info } = await image
      .rotate()
      .resize({
        width: 1600,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    return {
      data,
      width: info.width,
      height: info.height,
      mimeType: "image/webp",
      sizeBytes: info.size,
    };
  } catch (error) {
    if (error instanceof ImageError) throw error;
    throw new ImageError("No se ha podido leer la imagen. ¿Está dañada?");
  }
}
