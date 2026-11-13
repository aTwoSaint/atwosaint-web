import { z } from "zod";
import { isTraktrainUrl } from "./links";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const buyUrl = z
  .string()
  .trim()
  .max(500, "El enlace es demasiado largo.")
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => v === undefined || isTraktrainUrl(v), {
    message: "Pega un enlace https de Traktrain (traktrain.com).",
  })
  .optional();

export const albumSchema = z.object({
  title: z.string().trim().min(1, "Escribe un título.").max(80, "El título admite hasta 80 caracteres."),
  artist: z.string().trim().min(1, "Escribe el artista.").max(80, "El artista admite hasta 80 caracteres."),
  kind: z.enum(["album", "ep", "single", "beat_tape"]),
  year: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= 1900 && v <= 2100), {
      message: "Año no válido.",
    })
    .optional(),
  description: optionalText(1000, "La descripción admite hasta 1000 caracteres."),
  buyUrl,
  status: z.enum(["draft", "published"]),
});
export type AlbumInput = z.infer<typeof albumSchema>;

const optionalInt = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= min && v <= max), { message })
    .optional();

/** Campos de ficha de un beat (alta y edición). Todos son texto de formulario. */
const beatDetails = {
  title: z.string().trim().min(1, "Escribe el nombre del beat.").max(100, "El nombre admite hasta 100 caracteres."),
  buyUrl,
  bpm: optionalInt(30, 300, "El BPM debe ser un número entero entre 30 y 300."),
  musicalKey: optionalText(20, "La tonalidad admite hasta 20 caracteres."),
  description: optionalText(600, "La descripción admite hasta 600 caracteres."),
  releasedOn: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), {
      message: "Fecha no válida (AAAA-MM-DD).",
    })
    .optional(),
};

export const trackSchema = z.object({
  albumId: z.uuid(),
  ...beatDetails,
  durationSeconds: z.number().int().min(0).max(60 * 60 * 5).nullable().optional(),
  url: z.string().max(1000),
  pathname: z.string().max(500),
});
export type TrackInput = z.infer<typeof trackSchema>;

export const trackUpdateSchema = z.object({ id: z.uuid(), ...beatDetails });
export type TrackUpdateInput = z.infer<typeof trackUpdateSchema>;

export const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"] as const;
export const MAX_AUDIO_BYTES = 80 * 1024 * 1024;
export const AUDIO_PATH_PREFIX = "musica/audio/";
