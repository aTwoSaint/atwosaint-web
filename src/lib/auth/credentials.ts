import "server-only";
import { getAuthEnv } from "@/lib/config/env";
import { hashPassword, verifyPassword } from "./password";
import { safeEqual } from "./session";

/**
 * Comprueba correo y contraseña del administrador.
 * Hace siempre el mismo trabajo (una derivación scrypt para obtener el hash de referencia
 * si se usa ADMIN_PASSWORD, y otra para la contraseña enviada), coincida o no el correo,
 * para no revelar por el tiempo de respuesta cuál de los dos datos falló.
 */
export async function checkAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const env = getAuthEnv();
  const emailOk = safeEqual(email.toLowerCase(), env.ADMIN_EMAIL.toLowerCase());
  const reference =
    env.ADMIN_PASSWORD_HASH ?? (await hashPassword(env.ADMIN_PASSWORD ?? ""));
  const passwordOk = await verifyPassword(password, reference);
  return emailOk && passwordOk;
}
