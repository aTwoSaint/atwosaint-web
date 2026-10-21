import { describe, expect, it } from "vitest";
import {
  createReferenceSchema,
  idSchema,
  loginSchema,
} from "@/features/references/schema";

const valid = {
  title: "  Título  ",
  description: "Descripción",
  category: "",
  alt: "Texto alternativo",
  status: "published",
};

describe("createReferenceSchema", () => {
  it("recorta espacios y convierte la categoría vacía en undefined", () => {
    const r = createReferenceSchema.parse(valid);
    expect(r.title).toBe("Título");
    expect(r.category).toBeUndefined();
  });
  it("exige título, descripción y texto alternativo", () => {
    for (const key of ["title", "description", "alt"] as const) {
      expect(createReferenceSchema.safeParse({ ...valid, [key]: "   " }).success).toBe(false);
    }
  });
  it("aplica límites de longitud", () => {
    expect(createReferenceSchema.safeParse({ ...valid, title: "a".repeat(81) }).success).toBe(false);
    expect(createReferenceSchema.safeParse({ ...valid, description: "a".repeat(601) }).success).toBe(false);
  });
  it("solo admite estados conocidos", () => {
    expect(createReferenceSchema.safeParse({ ...valid, status: "hacked" }).success).toBe(false);
  });
  it("rechaza valores que no son texto (p. ej. un archivo en un campo de texto)", () => {
    expect(createReferenceSchema.safeParse({ ...valid, title: new File(["x"], "x.txt") }).success).toBe(false);
  });
});

describe("otros esquemas", () => {
  it("idSchema solo admite UUID", () => {
    expect(idSchema.safeParse("no-es-uuid").success).toBe(false);
    expect(idSchema.safeParse("' OR 1=1 --").success).toBe(false);
    expect(idSchema.safeParse(crypto.randomUUID()).success).toBe(true);
  });
  it("loginSchema limita el tamaño de las entradas", () => {
    expect(loginSchema.safeParse({ email: "a@b.c", password: "x".repeat(201) }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.c", password: "ok" }).success).toBe(true);
  });
});
