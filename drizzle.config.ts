import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  // Solo hace falta para `db:migrate`; `db:generate` funciona sin conexión.
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
