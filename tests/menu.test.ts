import { describe, expect, it } from "vitest";
import { clampPage, pageCount, pageSlice } from "@/features/menu/pagination";
import { formatLongDate, formatReferenceDate, formatShortDate } from "@/features/menu/format";
import { hasContact, parseContact } from "@/features/contact/contact";

describe("paginación del menú", () => {
  it("calcula páginas para cualquier cantidad", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(5)).toBe(1);
    expect(pageCount(12)).toBe(1);
    expect(pageCount(13)).toBe(2);
    expect(pageCount(100)).toBe(9);
  });
  it("recorta la página a un valor válido", () => {
    expect(clampPage(-3, 30)).toBe(0);
    expect(clampPage(99, 30)).toBe(2);
    expect(clampPage(NaN, 30)).toBe(0);
    expect(clampPage(5, 0)).toBe(0);
  });
  it("no rellena con elementos falsos", () => {
    const items = Array.from({ length: 14 }, (_, i) => i);
    expect(pageSlice(items, 0)).toHaveLength(12);
    expect(pageSlice(items, 1)).toEqual([12, 13]);
    expect(pageSlice([1, 2, 3], 0)).toEqual([1, 2, 3]);
    expect(pageSlice([], 0)).toEqual([]);
  });
});

describe("fechas en español", () => {
  it("formatea día de la semana y fecha", () => {
    const d = new Date(2026, 9, 29, 18, 5);
    expect(formatLongDate(d)).toBe("Jueves, 29 de octubre");
    expect(formatShortDate(d)).toMatch(/^Jue/);
    expect(formatReferenceDate("2026-10-13T12:00:00.000Z")).toContain("2026");
    expect(formatReferenceDate("no-es-fecha")).toBe("");
  });
});

describe("contacto", () => {
  it("sin configuración no muestra nada", () => {
    expect(hasContact(parseContact({}))).toBe(false);
  });
  it("acepta correo válido e Instagram https", () => {
    const c = parseContact({
      CONTACT_EMAIL: " hola@ejemplo.com ",
      CONTACT_INSTAGRAM_URL: "https://www.instagram.com/alguien/",
    });
    expect(c).toEqual({ email: "hola@ejemplo.com", instagram: "https://www.instagram.com/alguien/" });
  });
  it("rechaza valores no válidos o peligrosos", () => {
    expect(
      parseContact({ CONTACT_EMAIL: "no-es-correo", CONTACT_INSTAGRAM_URL: "javascript:alert(1)" }),
    ).toEqual({});
    expect(parseContact({ CONTACT_INSTAGRAM_URL: "http://instagram.com/x" })).toEqual({});
    expect(parseContact({ CONTACT_INSTAGRAM_URL: "https://instagram.com.evil.com/x" })).toEqual({});
  });
});
