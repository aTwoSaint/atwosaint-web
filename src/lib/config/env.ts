import { z } from "zod";

/**
 * Variables de entorno validadas de forma perezosa: solo se leen cuando se
 * usan, de modo que el build y la CI funcionan sin secretos (con USE_SAMPLE_DATA=1).
 * Los valores nunca se muestran en los mensajes de error.
 */

const databaseSchema = z.object({
  DATABASE_URL: z.string().min(1, "está vacía"),
});

/** En Vercel una variable vacía llega como "": se trata como si no existiera. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const authFields = z.object({
  AUTH_SECRET: z
    .string()
    .min(32, "debe tener al menos 32 caracteres"),
  ADMIN_EMAIL: z.email("no es un correo válido"),
  /** Recomendado: hash scrypt generado con `npm run admin:hash`. */
  ADMIN_PASSWORD_HASH: optional(
    z
      .string()
      .regex(
        /^[0-9a-f]{32}:[0-9a-f]{128}$/,
        "tiene un formato no válido",
      ),
  ),
  /** Alternativa sin herramientas: contraseña en claro, marcada como «Sensitive» en Vercel. */
  ADMIN_PASSWORD: optional(
    z.string().min(12, "debe tener al menos 12 caracteres"),
  ),
});

const authSchema = authFields.refine(
  (v) => Boolean(v.ADMIN_PASSWORD_HASH ?? v.ADMIN_PASSWORD),
  {
    message: "define este valor (recomendado) o ADMIN_PASSWORD",
    path: ["ADMIN_PASSWORD_HASH"],
  },
);

const sessionSchema = authFields.pick({ AUTH_SECRET: true });

const blobSchema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "está vacía"),
});

type Issue = { path: PropertyKey[]; message: string };

/** Nombra siempre la variable afectada; nunca incluye su valor. */
function describeIssue(issue: Issue): string {
  const variable = issue.path.map(String).join(".");
  const message = /received undefined/.test(issue.message)
    ? "no está definida"
    : issue.message;
  return variable ? `${variable}: ${message}` : message;
}

function read<T extends z.ZodType>(schema: T, name: string): z.infer<T> {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map(describeIssue).join("; ");
    const vercelEnv = process.env.VERCEL_ENV;
    const hint = vercelEnv
      ? ` Entorno de Vercel de esta compilación: ${vercelEnv}. Comprueba que la variable está marcada para ese entorno (Settings → Environment Variables) y vuelve a desplegar.`
      : "";
    throw new Error(`Configuración de ${name} incompleta (${problems}).${hint}`);
  }
  return parsed.data;
}

/** Solo el secreto de sesión (lo usa el proxy, que no necesita el resto de variables). */
export const getSessionSecret = () =>
  read(sessionSchema, "la sesión").AUTH_SECRET;

export const getDatabaseEnv = () => read(databaseSchema, "la base de datos");
export const getAuthEnv = () => read(authSchema, "la autenticación");
export const getBlobEnv = () => read(blobSchema, "el almacenamiento de imágenes");

/** Solo para desarrollo y CI: sirve el contenido de ejemplo sin base de datos. */
export const isSampleDataMode = () => process.env.USE_SAMPLE_DATA === "1";
