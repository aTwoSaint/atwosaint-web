import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { albums } from "@/content/music";
import { formatDuration, isBeatStarsUrl, isBlobUrl } from "@/features/music/links";
import { buildSlots, MIN_SLOTS } from "@/features/music/slots";
import { albumSchema, trackSchema } from "@/features/music/schema";
import {
  angleForIndex,
  frontIndex,
  frontness,
  ringRadius,
  shortestDelta,
  wrap180,
} from "@/features/music/ring";

describe("catálogo de demostración", () => {
  it("slugs e ids únicos y portadas existentes", () => {
    expect(new Set(albums.map((a) => a.slug)).size).toBe(albums.length);
    expect(new Set(albums.map((a) => a.id)).size).toBe(albums.length);
    for (const a of albums) {
      if (!a.cover) continue;
      expect(existsSync(`public${a.cover.src}`), a.cover.src).toBe(true);
      expect(a.cover.alt.length).toBeGreaterThan(5);
    }
  });
  it("todo contenido de demostración está marcado", () => {
    for (const a of albums) {
      expect(a.demo).toBe(true);
      expect(a.artist).toContain("demo");
    }
  });
  it("los enlaces de compra, si los hay, son de BeatStars", () => {
    for (const a of albums) {
      if (a.buyUrl) expect(isBeatStarsUrl(a.buyUrl)).toBe(true);
      for (const t of a.tracks) if (t.buyUrl) expect(isBeatStarsUrl(t.buyUrl)).toBe(true);
    }
  });
});

describe("huecos del carrusel", () => {
  it("sin proyectos no se añaden huecos", () => {
    expect(buildSlots([])).toEqual([]);
  });
  it("con pocos proyectos se completa con huecos Coming Soon tras los reales", () => {
    const slots = buildSlots(albums.slice(0, 1));
    expect(slots).toHaveLength(MIN_SLOTS);
    expect(slots[0].kind).toBe("album");
    expect(slots.slice(1).every((x) => x.kind === "soon")).toBe(true);
    expect(new Set(slots.map((x) => (x.kind === "soon" ? x.id : x.album.id))).size).toBe(MIN_SLOTS);
  });
  it("con suficientes proyectos no se añaden huecos", () => {
    expect(buildSlots(albums).every((x) => x.kind === "album")).toBe(true);
  });
});

describe("enlaces y duraciones", () => {
  it("solo acepta https de BeatStars", () => {
    expect(isBeatStarsUrl("https://www.beatstars.com/atwosaint")).toBe(true);
    expect(isBeatStarsUrl("https://bsta.rs/abc")).toBe(true);
    expect(isBeatStarsUrl("http://beatstars.com/x")).toBe(false);
    expect(isBeatStarsUrl("https://beatstars.com.evil.com/x")).toBe(false);
    expect(isBeatStarsUrl("https://user:pw@beatstars.com/x")).toBe(false);
    expect(isBeatStarsUrl("javascript:alert(1)")).toBe(false);
    expect(isBeatStarsUrl("no es url")).toBe(false);
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
  it("rechaza enlaces de compra que no son BeatStars", () => {
    expect(albumSchema.safeParse({ ...base, buyUrl: "https://example.com/x" }).success).toBe(false);
    expect(albumSchema.safeParse({ ...base, buyUrl: "https://www.beatstars.com/x" }).success).toBe(true);
  });
  it("rechaza años absurdos y títulos vacíos", () => {
    expect(albumSchema.safeParse({ ...base, year: "1500" }).success).toBe(false);
    expect(albumSchema.safeParse({ ...base, title: " " }).success).toBe(false);
  });
  it("valida pistas", () => {
    const t = { albumId: "5b0f8c1e-6a43-4c7b-9a3e-2d1f4b6c8e90", title: "Pista", url: "https://x", pathname: "musica/audio/a.mp3" };
    expect(trackSchema.safeParse(t).success).toBe(true);
    expect(trackSchema.safeParse({ ...t, albumId: "nope" }).success).toBe(false);
  });
});

describe("geometría del anillo", () => {
  it("normaliza ángulos", () => {
    expect(wrap180(190)).toBe(-170);
    expect(wrap180(-190)).toBe(170);
    expect(wrap180(540)).toBe(180);
    expect(shortestDelta(350, 10)).toBe(20);
    expect(shortestDelta(10, 350)).toBe(-20);
  });
  it("la portada elegida queda de frente", () => {
    for (const n of [1, 3, 6, 12]) {
      for (let i = 0; i < n; i++) {
        expect(frontness(i, n, angleForIndex(i, n))).toBeCloseTo(1, 6);
        expect(frontIndex(n, angleForIndex(i, n))).toBe(i);
      }
    }
  });
  it("la opuesta queda detrás", () => {
    expect(frontness(3, 6, angleForIndex(0, 6))).toBeCloseTo(0, 6);
  });
  it("el radio crece con el número de portadas y nunca es menor que el mínimo", () => {
    expect(ringRadius(3, 200)).toBeGreaterThanOrEqual(290);
    expect(ringRadius(40, 200)).toBeGreaterThan(ringRadius(10, 200));
  });
});
