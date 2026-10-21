import {
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
