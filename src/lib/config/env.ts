import { z } from "zod";

/**
 * Variables de entorno validadas de forma perezosa: solo se leen cuando se
 * usan, de modo que el build y la CI funcionan sin secretos (con USE_SAMPLE_DATA=1).
 * Los valores nunca se muestran en los mensajes de error.
 */

const databaseSchema = z.object({
  DATABASE_URL: z.string().min(1, "falta DATABASE_URL"),
});

const authSchema = z.object({
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
  ADMIN_EMAIL: z.email("ADMIN_EMAIL no es un correo válido"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .regex(/^[0-9a-f]{32}:[0-9a-f]{128}$/, "ADMIN_PASSWORD_HASH tiene un formato no válido"),
});

const blobSchema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "falta BLOB_READ_WRITE_TOKEN"),
});

function read<T extends z.ZodType>(schema: T, name: string): z.infer<T> {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(`Configuración de ${name} incompleta: ${problems}`);
  }
  return parsed.data;
}

/** Solo el secreto de sesión (lo usa el proxy, que no necesita el resto de variables). */
export const getSessionSecret = () =>
  read(authSchema.pick({ AUTH_SECRET: true }), "la sesión").AUTH_SECRET;

export const getDatabaseEnv =() => read(databaseSchema, "la base de datos");
export const getAuthEnv = () => read(authSchema, "la autenticación");
export const getBlobEnv = () => read(blobSchema, "el almacenamiento de imágenes");

/** Solo para desarrollo y CI: sirve el contenido de ejemplo sin base de datos. */
export const isSampleDataMode = () => process.env.USE_SAMPLE_DATA === "1";
