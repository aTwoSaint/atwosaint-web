import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("quita acentos y signos", () => {
    expect(slugify("Estudio de Forma Nº 1 — ¡Ñandú!")).toBe(
      "estudio-de-forma-n-1-nandu",
    );
  });
  it("no deja guiones en los extremos", () => {
    expect(slugify("  --Hola--  ")).toBe("hola");
  });
  it("devuelve un valor por defecto si no queda nada", () => {
    expect(slugify("¿¿¿???")).toBe("referencia");
  });
  it("limita la longitud sin terminar en guion", () => {
    const slug = slugify("a".repeat(59) + " bbbbbb");
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith("-")).toBe(false);
  });
  it("neutraliza caracteres peligrosos para LIKE y URLs", () => {
    expect(slugify("100%_../etc?x=1")).toBe("100-etc-x-1");
  });
});

describe("uniqueSlug", () => {
  it("respeta el slug libre", () => {
    expect(uniqueSlug("hola", ["otro"])).toBe("hola");
  });
  it("añade sufijo numérico si está ocupado", () => {
    expect(uniqueSlug("hola", ["hola", "hola-2"])).toBe("hola-3");
  });
});
