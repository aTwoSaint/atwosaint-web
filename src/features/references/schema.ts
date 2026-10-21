import { z } from "zod";

/** Validación de los datos de texto del formulario de administración. */
export const createReferenceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Escribe un título.")
    .max(80, "El título admite hasta 80 caracteres."),
  description: z
    .string()
    .trim()
    .min(1, "Escribe una descripción.")
    .max(600, "La descripción admite hasta 600 caracteres."),
  category: z
    .string()
    .trim()
    .max(40, "La categoría admite hasta 40 caracteres.")
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  alt: z
    .string()
    .trim()
    .min(1, "Describe la imagen (texto alternativo, por accesibilidad).")
    .max(200, "El texto alternativo admite hasta 200 caracteres."),
  status: z.enum(["draft", "published"]),
});

export type CreateReferenceInput = z.infer<typeof createReferenceSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
});

export const idSchema = z.uuid();

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Valores enviados, para no perder lo escrito si hay un error. */
  values?: Partial<Record<string, string>>;
};
