import { z } from "zod";
import { isBeatStarsUrl } from "./links";

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
  .refine((v) => v === undefined || isBeatStarsUrl(v), {
    message: "Pega un enlace https de BeatStars (beatstars.com).",
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

export const trackSchema = z.object({
  albumId: z.uuid(),
  title: z.string().trim().min(1, "Escribe el nombre de la canción.").max(100, "El nombre admite hasta 100 caracteres."),
  buyUrl,
  durationSeconds: z.number().int().min(0).max(60 * 60 * 5).nullable().optional(),
  url: z.string().max(1000),
  pathname: z.string().max(500),
});
export type TrackInput = z.infer<typeof trackSchema>;

export const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"] as const;
export const MAX_AUDIO_BYTES = 80 * 1024 * 1024;
export const AUDIO_PATH_PREFIX = "musica/audio/";
