import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { beats } from "@/content/music";
import { formatDuration, isBlobUrl, isTraktrainUrl, resolveBuyUrl, TRAKTRAIN_PROFILE_URL } from "@/features/music/links";
import { clientIp, isLocked, MAX_FAILURES, throttleKey } from "@/lib/auth/throttle-policy";
import { albumSchema, trackSchema, trackUpdateSchema } from "@/features/music/schema";

describe("catálogo de demostración", () => {
  it("slugs e ids únicos y portadas existentes", () => {
    expect(new Set(beats.map((b) => b.slug)).size).toBe(beats.length);
    expect(new Set(beats.map((b) => b.id)).size).toBe(beats.length);
    for (const b of beats) {
      expect(b.cover).toBeDefined();
      expect(existsSync(`public${b.cover!.src}`)).toBe(true);
    }
  });
  it("todo contenido de demostración está marcado y su audio existe", () => {
    for (const b of beats) {
      expect(b.demo).toBe(true);
      expect(existsSync(`public${b.audioUrl}`)).toBe(true);
    }
  });
  it("los enlaces de compra, si los hay, son de Traktrain", () => {
    for (const b of beats) if (b.buyUrl) expect(isTraktrainUrl(b.buyUrl)).toBe(true);
  });
});

describe("enlaces y duraciones", () => {
  it("solo acepta https de Traktrain", () => {
    expect(isTraktrainUrl("https://traktrain.com/atwosaint")).toBe(true);
    expect(isTraktrainUrl("https://www.traktrain.com/atwosaint/beat")).toBe(true);
    expect(isTraktrainUrl("http://traktrain.com/x")).toBe(false);
    expect(isTraktrainUrl("https://traktrain.com.evil.com/x")).toBe(false);
    expect(isTraktrainUrl("https://user:pw@traktrain.com/x")).toBe(false);
    expect(isTraktrainUrl("https://www.beatstars.com/x")).toBe(false);
    expect(isTraktrainUrl("javascript:alert(1)")).toBe(false);
    expect(isTraktrainUrl("no es url")).toBe(false);
  });
  it("el botón de compra usa el enlace del beat, luego el del proyecto y por último el perfil", () => {
    expect(resolveBuyUrl("https://traktrain.com/atwosaint/a", "https://traktrain.com/atwosaint/b")).toBe("https://traktrain.com/atwosaint/a");
    expect(resolveBuyUrl(undefined, "https://traktrain.com/atwosaint/b")).toBe("https://traktrain.com/atwosaint/b");
    expect(resolveBuyUrl(null, undefined)).toBe(TRAKTRAIN_PROFILE_URL);
    // Un enlace antiguo o ajeno nunca llega al botón.
    expect(resolveBuyUrl("https://www.beatstars.com/x")).toBe(TRAKTRAIN_PROFILE_URL);
    expect(TRAKTRAIN_PROFILE_URL).toBe("https://traktrain.com/atwosaint");
  });
  it("solo acepta audio del Blob propio", () => {
    expect(isBlobUrl("https://abc.public.blob.vercel-storage.com/musica/audio/a.mp3")).toBe(true);
    expect(isBlobUrl("https://evil.com/a.mp3")).toBe(false);
    expect(isBlobUrl("http://abc.public.blob.vercel-storage.com/a.mp3")).toBe(false);
  });
  it("formatea duraciones", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(null)).toBeUndefined();
    expect(formatDuration(-3)).toBeUndefined();
  });
});

describe("validación del admin de música", () => {
  const base = { title: "Demo", artist: "A", kind: "album", year: "", description: "", buyUrl: "", status: "draft" };
  it("acepta datos válidos y normaliza vacíos", () => {
    const r = albumSchema.parse(base);
    expect(r.buyUrl).toBeUndefined();
    expect(r.year).toBeUndefined();
  });
  it("rechaza enlaces de compra que no son Traktrain", () => {
    expect(albumSchema.safeParse({ ...base, buyUrl: "https://example.com/x" }).success).toBe(false);
    expect(albumSchema.safeParse({ ...base, buyUrl: "https://www.beatstars.com/x" }).success).toBe(false);
    expect(albumSchema.safeParse({ ...base, buyUrl: "https://traktrain.com/atwosaint/x" }).success).toBe(true);
  });
  it("rechaza años absurdos y títulos vacíos", () => {
    expect(albumSchema.safeParse({ ...base, year: "1500" }).success).toBe(false);
    expect(albumSchema.safeParse({ ...base, title: " " }).success).toBe(false);
  });
  const track = { albumId: "5b0f8c1e-6a43-4c7b-9a3e-2d1f4b6c8e90", title: "Pista", url: "https://x", pathname: "musica/audio/a.mp3" };
  it("valida beats y normaliza los campos opcionales vacíos", () => {
    const ok = trackSchema.safeParse({ ...track, bpm: "", musicalKey: "", description: "", releasedOn: "", buyUrl: "" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.bpm).toBeUndefined();
      expect(ok.data.releasedOn).toBeUndefined();
    }
    expect(trackSchema.safeParse({ ...track, albumId: "nope" }).success).toBe(false);
  });
  it("valida BPM, fecha y enlace del beat", () => {
    expect(trackSchema.safeParse({ ...track, bpm: "140", releasedOn: "2026-11-13", musicalKey: "F# minor" }).success).toBe(true);
    expect(trackSchema.safeParse({ ...track, bpm: "5" }).success).toBe(false);
    expect(trackSchema.safeParse({ ...track, bpm: "140.5" }).success).toBe(false);
    expect(trackSchema.safeParse({ ...track, releasedOn: "13/11/2026" }).success).toBe(false);
    expect(trackSchema.safeParse({ ...track, releasedOn: "2026-13-45" }).success).toBe(false);
    expect(trackSchema.safeParse({ ...track, buyUrl: "https://evil.example/x" }).success).toBe(false);
  });
  it("la edición exige un id válido", () => {
    expect(trackUpdateSchema.safeParse({ id: track.albumId, title: "Nuevo" }).success).toBe(true);
    expect(trackUpdateSchema.safeParse({ id: "x'; DROP TABLE tracks;--", title: "Nuevo" }).success).toBe(false);
  });
});

describe("política de bloqueo del acceso", () => {
  it("bloquea a partir de 5 fallos, no antes", () => {
    expect(isLocked(MAX_FAILURES - 1)).toBe(false);
    expect(isLocked(MAX_FAILURES)).toBe(true);
  });
  it("toma la IP de x-real-ip o, si no, del primer valor de x-forwarded-for", () => {
    const h = (o: Record<string, string>) => ({ get: (n: string) => o[n] ?? null });
    expect(clientIp(h({ "x-real-ip": "1.2.3.4", "x-forwarded-for": "9.9.9.9" }))).toBe("1.2.3.4");
    expect(clientIp(h({ "x-forwarded-for": "5.6.7.8, 10.0.0.1" }))).toBe("5.6.7.8");
    expect(clientIp(h({}))).toBe("desconocida");
  });
  it("la clave es anónima, estable y depende del secreto", () => {
    const k = throttleKey("1.2.3.4", "secreto-de-prueba-largo-0123456789abcdef");
    expect(k).toMatch(/^[0-9a-f]{64}$/);
    expect(k).not.toContain("1.2.3.4");
    expect(throttleKey("1.2.3.4", "secreto-de-prueba-largo-0123456789abcdef")).toBe(k);
    expect(throttleKey("1.2.3.5", "secreto-de-prueba-largo-0123456789abcdef")).not.toBe(k);
    expect(throttleKey("1.2.3.4", "otro-secreto-de-prueba-0123456789abcdefgh")).not.toBe(k);
  });
});
