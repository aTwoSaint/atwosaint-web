import { describe, expect, it } from "vitest";
import {
  burnPasswordCheck,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

describe("contraseñas", () => {
  it("genera el formato esperado por ADMIN_PASSWORD_HASH", async () => {
    const hash = await hashPassword("una-contraseña-larga-123");
    expect(hash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword("una-contraseña-larga-123");
    expect(await verifyPassword("una-contraseña-larga-123", hash)).toBe(true);
    expect(await verifyPassword("otra-contraseña-larga", hash)).toBe(false);
  });

  it("usa una sal distinta cada vez", async () => {
    const a = await hashPassword("misma-contraseña-123");
    const b = await hashPassword("misma-contraseña-123");
    expect(a).not.toBe(b);
  });

  it("rechaza hashes mal formados sin lanzar", async () => {
    expect(await verifyPassword("x", "no-es-un-hash")).toBe(false);
    expect(await verifyPassword("x", "aa:bb")).toBe(false);
  });

  it("burnPasswordCheck no falla", async () => {
    await expect(burnPasswordCheck("x")).resolves.toBeUndefined();
  });
});
