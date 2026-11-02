import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { albums } from "@/content/music";
import {
  angleForIndex,
  frontIndex,
  frontness,
  ringRadius,
  shortestDelta,
  wrap180,
} from "@/features/music/ring";

describe("catálogo de Music", () => {
  it("slugs e ids únicos y portadas existentes", () => {
    expect(new Set(albums.map((a) => a.slug)).size).toBe(albums.length);
    expect(new Set(albums.map((a) => a.id)).size).toBe(albums.length);
    for (const a of albums) {
      expect(existsSync(`public${a.cover.src}`), a.cover.src).toBe(true);
      expect(a.cover.alt.length).toBeGreaterThan(5);
    }
  });
  it("todo contenido de demostración está marcado y sin enlaces inventados", () => {
    for (const a of albums.filter((x) => x.demo)) {
      expect(a.links).toEqual([]);
      expect(a.artist).toContain("demo");
    }
  });
  it("los enlaces de escucha, si los hay, son https", () => {
    for (const a of albums) for (const l of a.links) expect(new URL(l.url).protocol).toBe("https:");
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
