import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Hash de contraseña con scrypt (parámetros recomendados por OWASP: N=2^15, r=8, p=3).
 * Formato almacenado: `<sal hex>:<hash hex>` (sin `$`, para que dotenv no lo expanda).
 * Módulo sin dependencias de Next para poder usarlo también desde scripts.
 */

const N = 2 ** 15;
const R = 8;
const P = 3;
const KEYLEN = 64;
const SALT_BYTES = 16;
const MAXMEM = 128 * N * R * 2;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      KEYLEN,
      { N, r: R, p: P, maxmem: MAXMEM },
      (err, key) => (err ? reject(err) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== KEYLEN) return false;
  const actual = await derive(password, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(actual, expected);
}
