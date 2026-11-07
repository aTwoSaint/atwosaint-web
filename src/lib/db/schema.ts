import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const referenceStatus = pgEnum("reference_status", [
  "draft",
  "published",
]);

/** Metadatos de cada imagen. El archivo vive en Vercel Blob, nunca en la base de datos. */
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** URL pública del archivo en Vercel Blob. */
  url: text("url").notNull(),
  /** Ruta dentro del almacén; sirve para borrar el archivo. */
  storageKey: text("storage_key").notNull(),
  alt: text("alt").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const references = pgTable("references", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  primaryImageId: uuid("primary_image_id")
    .notNull()
    .references(() => images.id, { onDelete: "restrict" }),
  hoverImageId: uuid("hover_image_id").references(() => images.id, {
    onDelete: "restrict",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  status: referenceStatus("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const musicKind = pgEnum("music_kind", [
  "album",
  "ep",
  "single",
  "beat_tape",
]);

/** Proyectos de música (álbum, EP, single, beat tape). La portada reutiliza la tabla `images`. */
export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  kind: musicKind("kind").notNull().default("album"),
  year: integer("year"),
  description: text("description"),
  /** Enlace de compra (BeatStars). Opcional. */
  buyUrl: text("buy_url"),
  coverImageId: uuid("cover_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  /** Imagen que aparece al pasar el cursor por la portada (opcional). */
  hoverImageId: uuid("hover_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  sortOrder: integer("sort_order").notNull().default(0),
  status: referenceStatus("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Canciones de un proyecto. El audio (mp3/wav) vive en Vercel Blob, nunca en la base de datos. */
export const tracks = pgTable("tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  /** Ruta dentro del almacén; sirve para borrar el archivo. */
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  durationSeconds: integer("duration_seconds"),
  /** Enlace de compra propio de esta canción/beat (opcional). */
  buyUrl: text("buy_url"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Intentos de acceso fallidos, para frenar la fuerza bruta. Solo guarda un identificador
 * anónimo (HMAC de la IP con AUTH_SECRET), nunca la IP en claro ni la contraseña.
 */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("login_attempts_key_created_idx").on(t.key, t.createdAt)],
);
