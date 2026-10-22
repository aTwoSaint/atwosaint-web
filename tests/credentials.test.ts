import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashPassword } from "@/lib/auth/password";

const KEYS = [
  "AUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_PASSWORD_HASH",
] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  process.env.AUTH_SECRET = "x".repeat(40);
  process.env.ADMIN_EMAIL = "Admin@Example.com";
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

const check = async (email: string, password: string) =>
  (await import("@/lib/auth/credentials")).checkAdminCredentials(email, password);

describe("credenciales con ADMIN_PASSWORD (texto en Vercel)", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "una-contraseña-larga-123";
  });

  it("acepta la contraseña y el correo correctos (sin distinguir mayúsculas en el correo)", async () => {
    expect(await check("admin@example.com", "una-contraseña-larga-123")).toBe(true);
  });
  it("rechaza contraseña incorrecta", async () => {
    expect(await check("admin@example.com", "otra-contraseña-larga")).toBe(false);
  });
  it("rechaza correo incorrecto aunque la contraseña sea la buena", async () => {
    expect(await check("otro@example.com", "una-contraseña-larga-123")).toBe(false);
  });
  it("rechaza contraseña vacía", async () => {
    expect(await check("admin@example.com", "")).toBe(false);
  });
});

describe("credenciales con ADMIN_PASSWORD_HASH", () => {
  it("acepta la contraseña que generó el hash", async () => {
    process.env.ADMIN_PASSWORD_HASH = await hashPassword("clave-con-hash-12345");
    expect(await check("admin@example.com", "clave-con-hash-12345")).toBe(true);
    expect(await check("admin@example.com", "otra")).toBe(false);
  });

  it("el hash tiene prioridad si también hay ADMIN_PASSWORD", async () => {
    process.env.ADMIN_PASSWORD_HASH = await hashPassword("clave-con-hash-12345");
    process.env.ADMIN_PASSWORD = "contraseña-en-claro-999";
    expect(await check("admin@example.com", "clave-con-hash-12345")).toBe(true);
    expect(await check("admin@example.com", "contraseña-en-claro-999")).toBe(false);
  });
});

describe("validación de la configuración", () => {
  it("falla si no hay ni hash ni contraseña", async () => {
    await expect(check("admin@example.com", "x")).rejects.toThrow(/ADMIN_PASSWORD/);
  });

  it("trata las variables vacías como ausentes", async () => {
    process.env.ADMIN_PASSWORD_HASH = "";
    process.env.ADMIN_PASSWORD = "una-contraseña-larga-123";
    expect(await check("admin@example.com", "una-contraseña-larga-123")).toBe(true);
  });

  it("rechaza una contraseña en claro demasiado corta", async () => {
    process.env.ADMIN_PASSWORD = "corta";
    await expect(check("admin@example.com", "corta")).rejects.toThrow(/12 caracteres/);
  });

  it("rechaza un hash con formato no válido", async () => {
    process.env.ADMIN_PASSWORD_HASH = "no-es-un-hash";
    await expect(check("admin@example.com", "x")).rejects.toThrow(/formato no válido/);
  });

  it("los mensajes de error no incluyen los valores configurados", async () => {
    process.env.ADMIN_PASSWORD = "SECRETO-1";
    await expect(check("admin@example.com", "x")).rejects.toThrow();
    try {
      await check("admin@example.com", "x");
    } catch (e) {
      expect(String(e)).not.toContain("SECRETO-1");
    }
  });

  it("el secreto de sesión se valida por separado y exige 32 caracteres", async () => {
    process.env.AUTH_SECRET = "corto";
    const { getSessionSecret } = await import("@/lib/config/env");
    expect(() => getSessionSecret()).toThrow(/32 caracteres/);
  });
});

describe("mensajes de configuración", () => {
  const saved = {
    db: process.env.DATABASE_URL,
    env: process.env.VERCEL_ENV,
  };
  afterEach(() => {
    if (saved.db === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved.db;
    if (saved.env === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = saved.env;
  });

  it("nombra la variable cuando no está definida", async () => {
    delete process.env.DATABASE_URL;
    const { getDatabaseEnv } = await import("@/lib/config/env");
    expect(() => getDatabaseEnv()).toThrow(/DATABASE_URL: no está definida/);
  });

  it("nombra la variable cuando está vacía", async () => {
    process.env.DATABASE_URL = "";
    const { getDatabaseEnv } = await import("@/lib/config/env");
    expect(() => getDatabaseEnv()).toThrow(/DATABASE_URL: está vacía/);
  });

  it("indica el entorno de Vercel si se conoce", async () => {
    delete process.env.DATABASE_URL;
    process.env.VERCEL_ENV = "preview";
    const { getDatabaseEnv } = await import("@/lib/config/env");
    expect(() => getDatabaseEnv()).toThrow(/Entorno de Vercel .*: preview/);
  });

  it("no incluye el valor de la variable en el error", async () => {
    process.env.AUTH_SECRET = "SECRETO-CORTO";
    const { getSessionSecret } = await import("@/lib/config/env");
    try {
      getSessionSecret();
      throw new Error("debía fallar");
    } catch (e) {
      expect(String(e)).toMatch(/AUTH_SECRET: debe tener al menos 32/);
      expect(String(e)).not.toContain("SECRETO-CORTO");
    }
  });
});

