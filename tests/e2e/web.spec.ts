import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { TEST_ADMIN } from "../../playwright.config";

const VIEWS = {
  inicio: "/",
  ficha: "/referencias/estudio-de-forma-001",
  acceso: "/admin/login",
  "404": "/no-existe",
} as const;

const VIEWPORTS = {
  movil: { width: 390, height: 844 },
  escritorio: { width: 1440, height: 900 },
} as const;

async function violations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  return result.violations.map(
    (v) => `${v.impact}: ${v.id} (${v.nodes.length}) — ${v.nodes[0]?.html.slice(0, 120)}`,
  );
}

test.describe("accesibilidad (axe, WCAG 2.2 AA)", () => {
  for (const scheme of ["light", "dark"] as const) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      for (const [viewName, path] of Object.entries(VIEWS)) {
        test(`${viewName} · ${vpName} · ${scheme}`, async ({ browser }) => {
          const context = await browser.newContext({ viewport, colorScheme: scheme });
          const page = await context.newPage();
          await page.goto(path, { waitUntil: "networkidle" });
          expect(await violations(page)).toEqual([]);
          await context.close();
        });
      }
    }
  }
});

test.describe("diseño responsive", () => {
  const cases: [keyof typeof VIEWPORTS | "tableta", { width: number; height: number }, number][] = [
    ["movil", VIEWPORTS.movil, 2],
    ["tableta", { width: 820, height: 1180 }, 3],
    ["escritorio", VIEWPORTS.escritorio, 3],
  ];
  for (const [name, viewport, columns] of cases) {
    test(`rejilla de ${columns} columnas y sin desbordes · ${name}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      const cols = await page.evaluate(
        () => getComputedStyle(document.querySelector("main ul")!).gridTemplateColumns.split(" ").length,
      );
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(cols).toBe(columns);
      expect(overflow).toBe(0);
      await context.close();
    });
  }

  test("4 columnas en pantallas muy anchas", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const cols = await page.evaluate(
      () => getComputedStyle(document.querySelector("main ul")!).gridTemplateColumns.split(" ").length,
    );
    expect(cols).toBe(4);
    await context.close();
  });
});

test.describe("tarjetas de referencia", () => {
  test("el enlace se llama como el título visible (WCAG 2.5.3)", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("main ul li a").first();
    await expect(link).toHaveText("Estudio de forma 001");
  });

  test("un clic sobre la imagen abre la ficha", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const box = (await page.locator("main ul li figure").first().boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(/\/referencias\/estudio-de-forma-001$/);
  });

  test("el teclado recorre las tarjetas en orden", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const focused: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      focused.push(
        await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""),
      );
    }
    expect(focused[0]).toBe("Saltar al contenido");
    expect(focused.slice(3)).toEqual([
      "Estudio de forma 001",
      "Estudio de forma 002",
      "Estudio de forma 003",
      "Estudio de forma 004",
      "Estudio de forma 005",
    ]);
  });

  test("la segunda imagen aparece al pasar el cursor", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.mouse.move(2, 2); // asegura que el cursor no está sobre la tarjeta
    const card = page.locator("main ul li").first();
    const second = card.locator("figure img").nth(1);
    await expect(second).toHaveCSS("opacity", "0");
    await card.hover();
    await expect(second).toHaveCSS("opacity", "1");
  });

  test("con movimiento reducido no hay transición", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const duration = await page
      .locator("main ul li figure img")
      .nth(1)
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThan(0.001);
    await context.close();
  });
});

test.describe("rutas y cabeceras", () => {
  test("una ficha inexistente devuelve 404", async ({ request }) => {
    const res = await request.get("/referencias/no-existe");
    expect(res.status()).toBe(404);
  });

  test("cabeceras de seguridad presentes", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    const csp = h["content-security-policy"];
    for (const d of ["frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'", "object-src 'none'"]) {
      expect(csp).toContain(d);
    }
  });

  test("robots.txt oculta /admin", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Disallow: /admin");
  });
});

test.describe("administración", () => {
  test("sin sesión, /admin redirige al acceso con un 307", async ({ request }) => {
    const res = await request.get("/admin", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toContain("/admin/login");
  });

  test("una cookie de sesión falsificada no da acceso", async ({ request }) => {
    for (const name of ["__Host-atw_session", "atw_session"]) {
      const res = await request.get("/admin", {
        maxRedirects: 0,
        headers: { cookie: `${name}=eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.` },
      });
      expect(res.status()).toBe(307);
    }
  });

  test("el acceso no se indexa", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("contraseña incorrecta: mensaje genérico, correo conservado, contraseña vaciada", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.fill("input[name=email]", TEST_ADMIN.email);
    await page.fill("input[name=password]", "contraseña-incorrecta-123");
    await page.click("button[type=submit]");
    await expect(page.locator("form [role=alert]")).toHaveText("Correo o contraseña incorrectos.");
    await expect(page.locator("input[name=email]")).toHaveValue(TEST_ADMIN.email);
    await expect(page.locator("input[name=password]")).toHaveValue("");
  });

  test("correo incorrecto: el mismo mensaje que con contraseña incorrecta", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.fill("input[name=email]", "otra@example.test");
    await page.fill("input[name=password]", TEST_ADMIN.password);
    await page.click("button[type=submit]");
    await expect(page.locator("form [role=alert]")).toHaveText("Correo o contraseña incorrectos.");
  });

  test("credenciales correctas: sesión con cookies seguras y paso a /admin", async ({ page, context }) => {
    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.fill("input[name=email]", TEST_ADMIN.email);
    await page.fill("input[name=password]", TEST_ADMIN.password);
    await page.click("button[type=submit]");
    await expect(page).toHaveURL(/\/admin$/);

    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name.endsWith("atw_session"));
    expect(session, "cookie de sesión").toBeTruthy();
    expect(session!.httpOnly).toBe(true);
    expect(session!.secure).toBe(true);
    expect(session!.sameSite).toBe("Strict");
    const hint = cookies.find((c) => c.name === "atw_admin");
    expect(hint?.httpOnly).toBe(false); // solo una pista visual, sin valor de seguridad
  });
});
