import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

const SECRET = "x".repeat(40);

beforeAll(() => {
  process.env.AUTH_SECRET = SECRET;
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;
});

async function load() {
  const token = await import("@/lib/auth/token");
  const session = await import("@/lib/auth/session");
  return { ...token, safeEqual: session.safeEqual };
}

describe("sesión", () => {
  it("acepta un token propio", async () => {
    const { createSessionToken, verifySessionToken } = await load();
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });

  it("rechaza un token manipulado", async () => {
    const { createSessionToken, verifySessionToken } = await load();
    const token = await createSessionToken();
    const tampered = token.slice(0, -3) + (token.endsWith("aaa") ? "bbb" : "aaa");
    expect(await verifySessionToken(tampered)).toBe(false);
  });

  it("rechaza basura y cadenas vacías", async () => {
    const { verifySessionToken } = await load();
    expect(await verifySessionToken("")).toBe(false);
    expect(await verifySessionToken("a.b.c")).toBe(false);
  });

  it("rechaza un token firmado con otra clave", async () => {
    const { verifySessionToken } = await load();
    const foreign = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin")
      .setIssuer("atwosaint")
      .setAudience("atwosaint-admin")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("y".repeat(40)));
    expect(await verifySessionToken(foreign)).toBe(false);
  });

  it("rechaza un token caducado", async () => {
    const { verifySessionToken } = await load();
    const expired = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin")
      .setIssuer("atwosaint")
      .setAudience("atwosaint-admin")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(SECRET));
    expect(await verifySessionToken(expired)).toBe(false);
  });

  it("rechaza un token con otro sujeto o audiencia", async () => {
    const { verifySessionToken } = await load();
    const key = new TextEncoder().encode(SECRET);
    const wrongSub = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("otro")
      .setIssuer("atwosaint")
      .setAudience("atwosaint-admin")
      .setExpirationTime("1h")
      .sign(key);
    const wrongAud = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin")
      .setIssuer("atwosaint")
      .setAudience("otra-app")
      .setExpirationTime("1h")
      .sign(key);
    expect(await verifySessionToken(wrongSub)).toBe(false);
    expect(await verifySessionToken(wrongAud)).toBe(false);
  });

  it("rechaza un token sin firma (alg none)", async () => {
    const { verifySessionToken } = await load();
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const none = `${b64({ alg: "none", typ: "JWT" })}.${b64({
      sub: "admin",
      iss: "atwosaint",
      aud: "atwosaint-admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
    })}.`;
    expect(await verifySessionToken(none)).toBe(false);
  });

  it("safeEqual compara sin depender de la longitud", async () => {
    const { safeEqual } = await load();
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
