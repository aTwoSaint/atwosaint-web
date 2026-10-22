import { defineConfig } from "@playwright/test";

const PORT = 3100;

/**
 * Pruebas e2e contra la build de producción con el contenido de ejemplo (sin base de datos).
 * Los valores de abajo son SOLO de prueba y no se usan en ningún entorno real.
 *
 * Uso:  npm run build  (con USE_SAMPLE_DATA=1)  y luego  npm run test:e2e
 * En un entorno con un Chromium ya instalado, indica su ruta con PW_CHROMIUM_PATH.
 */
export const TEST_ADMIN = {
  email: "admin@example.test",
  password: "contrasena-solo-para-pruebas-1",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      USE_SAMPLE_DATA: "1",
      AUTH_SECRET: "clave-de-prueba-0123456789-0123456789-abcdef",
      ADMIN_EMAIL: TEST_ADMIN.email,
      ADMIN_PASSWORD: TEST_ADMIN.password,
    },
  },
});
