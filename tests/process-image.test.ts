import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  ImageError,
  MAX_FILE_BYTES,
  processImage,
} from "@/lib/images/process";

const png = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: "#ff3b1f" } })
    .png()
    .toBuffer();

describe("processImage", () => {
  it("convierte a WebP y no supera el tamaño máximo", async () => {
    const out = await processImage(await png(3000, 4000));
    expect(out.mimeType).toBe("image/webp");
    expect(out.width).toBeLessThanOrEqual(1600);
    expect(out.height).toBeLessThanOrEqual(2000);
    expect((await sharp(out.data).metadata()).format).toBe("webp");
  });

  it("no amplía imágenes pequeñas", async () => {
    const out = await processImage(await png(200, 300));
    expect([out.width, out.height]).toEqual([200, 300]);
  });

  it("elimina los metadatos EXIF", async () => {
    const withExif = await sharp({
      create: { width: 400, height: 500, channels: 3, background: "#222" },
    })
      .jpeg()
      .withExif({ IFD0: { Copyright: "SECRETO-GPS", Artist: "Persona" } })
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();

    const out = await processImage(withExif);
    expect((await sharp(out.data).metadata()).exif).toBeUndefined();
    expect(out.data.includes(Buffer.from("SECRETO-GPS"))).toBe(false);
  });

  it("rechaza SVG, aunque lleve script", async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    await expect(processImage(svg)).rejects.toBeInstanceOf(ImageError);
  });

  it("rechaza archivos que no son imágenes aunque se disfracen", async () => {
    await expect(processImage(Buffer.from("MZ\x90\x00 no soy una imagen"))).rejects.toBeInstanceOf(ImageError);
    await expect(processImage(Buffer.from("<?php system($_GET['x']); ?>"))).rejects.toBeInstanceOf(ImageError);
  });

  it("rechaza archivos vacíos y demasiado grandes", async () => {
    await expect(processImage(Buffer.alloc(0))).rejects.toBeInstanceOf(ImageError);
    await expect(processImage(Buffer.alloc(MAX_FILE_BYTES + 1))).rejects.toBeInstanceOf(ImageError);
  });

  it("rechaza GIF (formato no admitido)", async () => {
    const gif = await sharp({
      create: { width: 10, height: 10, channels: 3, background: "#000" },
    })
      .gif()
      .toBuffer();
    await expect(processImage(gif)).rejects.toBeInstanceOf(ImageError);
  });

  it("rechaza imágenes con un número desproporcionado de píxeles", async () => {
    // PNG de 9000×9000 (81 Mpx) muy comprimible: pesa poco pero excede el límite de píxeles.
    const big = await sharp({
      create: { width: 9000, height: 9000, channels: 3, background: "#000" },
    })
      .png({ compressionLevel: 9 })
      .toBuffer();
    if (big.length > MAX_FILE_BYTES) return; // no aplicable si ya falla por tamaño
    await expect(processImage(big)).rejects.toBeInstanceOf(ImageError);
  });
});
