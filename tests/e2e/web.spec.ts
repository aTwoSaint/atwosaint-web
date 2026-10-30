import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type Browser,
  type BrowserContextOptions,
  type Page,
} from "@playwright/test";
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

test("accesibilidad de la pantalla de inicio (axe)", async ({ browser }) => {
  const context = await browser.newContext({ viewport: VIEWPORTS.escritorio });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200); // logotipo y mensaje ya visibles
  expect(await violations(page)).toEqual([]);
  await context.close();
});

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
          const context = await seenContext(browser, { viewport, colorScheme: scheme });
          const page = await context.newPage();
          await page.goto(path, { waitUntil: "networkidle" });
          await page.waitForTimeout(900); // fin de las animaciones de entrada
          expect(await violations(page)).toEqual([]);
          await context.close();
        });
      }
    }
  }
});

/** Sesión en la que la intro ya se ha visto (la mayoría de pruebas parten de aquí). */
async function seenContext(browser: Browser, options: BrowserContextOptions = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("atw_intro_seen", "1");
    } catch {}
  });
  return context;
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return errors;
}

const channels = (page: Page) => page.locator(".wii-channel");

test.describe("pantalla de inicio", () => {
  test("logotipo centrado en escritorio y móvil, con mensaje discreto", async ({ browser }) => {
    for (const viewport of [VIEWPORTS.escritorio, VIEWPORTS.movil]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("data-intro", "active");
      await page.waitForTimeout(1000); // fin de la animación de aparición
      const box = (await page.locator(".wii-intro__logo").boundingBox())!;
      expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(1.5);
      await expect(page.locator(".wii-intro__hint")).toHaveText("Haz clic para entrar");
      await context.close();
    }
  });

  for (const how of ["clic", "Enter", "Espacio"] as const) {
    test(`se entra con ${how}, sin recargar, y no reaparece`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: VIEWPORTS.escritorio });
      const page = await context.newPage();
      const errors = collectErrors(page);
      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate(() => ((window as unknown as { __marca: number }).__marca = 42));

      if (how === "clic") await page.mouse.click(700, 400);
      if (how === "Enter") await page.keyboard.press("Enter");
      if (how === "Espacio") await page.keyboard.press("Space");

      await expect(page.locator("html")).toHaveAttribute("data-intro", "leaving");
      await expect(page.locator("html")).toHaveAttribute("data-intro", "seen", { timeout: 3000 });
      await expect(page.locator(".wii-intro")).toBeHidden();
      await expect(channels(page).first()).toBeVisible();
      // Misma página: el estado de JavaScript se conserva.
      expect(await page.evaluate(() => (window as unknown as { __marca: number }).__marca)).toBe(42);

      // Navegación interna y recarga: la intro no vuelve.
      await channels(page).first().locator("a").click();
      await expect(page).toHaveURL(/\/referencias\//);
      await page.getByRole("link", { name: /Volver al menú/ }).click();
      await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
      await page.reload({ waitUntil: "networkidle" });
      await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
      await expect(page.locator(".wii-intro")).toBeHidden();
      expect(errors).toEqual([]);
      await context.close();
    });
  }

  test("el contenido queda inerte mientras la intro está activa", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.locator(".wii-stage").evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen", { timeout: 3000 });
    expect(await page.locator(".wii-stage").evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await context.close();
  });

  test("con movimiento reducido entra igualmente y sin esperas", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen", { timeout: 1000 });
    await expect(channels(page).first()).toBeVisible();
    await context.close();
  });

  test("sin JavaScript el menú se ve igualmente", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".wii-intro")).toBeHidden();
    await expect(channels(page).first()).toBeVisible();
    await context.close();
  });
});

test.describe("menú de canales", () => {
  const cases: [string, { width: number; height: number }, number][] = [
    ["móvil", VIEWPORTS.movil, 2],
    ["tableta", { width: 820, height: 1180 }, 3],
    ["escritorio", VIEWPORTS.escritorio, 4],
  ];
  for (const [name, viewport, columns] of cases) {
    test(`${columns} columnas y sin desbordes · ${name}`, async ({ browser }) => {
      const context = await seenContext(browser, { viewport });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      const cols = await page.evaluate(
        () => getComputedStyle(document.querySelector(".wii-grid")!).gridTemplateColumns.split(" ").length,
      );
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(cols).toBe(columns);
      expect(overflow).toBe(0);
      await context.close();
    });
  }

  test("escritorio: 4 × 3 canales entran sin desplazamiento y la barra no los tapa", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(channels(page)).toHaveCount(12);
    await page.waitForTimeout(1500); // fin de la entrada escalonada
    const boxes = await channels(page).evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: r.bottom };
      }),
    );
    expect(new Set(boxes.map((b) => b.top)).size).toBe(3);
    const barTop = (await page.locator(".wii-bar").boundingBox())!.y;
    expect(Math.max(...boxes.map((b) => b.bottom))).toBeLessThanOrEqual(barTop);
    await context.close();
  });

  test("las referencias salen de los datos (14): página 1 con 12 y página 2 con 2, sin relleno falso", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(channels(page).first().locator("a")).toHaveText("Estudio de forma 001");
    await expect(page.getByRole("button", { name: "Página anterior" })).toHaveCount(0);
    await page.getByRole("button", { name: "Página siguiente" }).click();
    await expect(channels(page)).toHaveCount(2);
    await expect(channels(page).first().locator("a")).toHaveText("Estudio de forma 013");
    await expect(page.getByRole("button", { name: "Página siguiente" })).toHaveCount(0);
    await page.keyboard.press("ArrowLeft");
    await expect(channels(page)).toHaveCount(12);
    await page.keyboard.press("ArrowRight");
    await expect(channels(page)).toHaveCount(2);
    await context.close();
  });

  test("la ficha vuelve a la misma página del menú y conserva la información", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Página siguiente" }).click();
    await channels(page).first().locator("a").click();
    await expect(page).toHaveURL(/estudio-de-forma-013$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estudio de forma 013");
    await expect(page.locator(".wii-detail__text")).not.toBeEmpty();
    await expect(page.locator(".wii-detail__meta")).toContainText("Composición");
    await page.getByRole("link", { name: /Volver al menú/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(channels(page)).toHaveCount(2);
    await context.close();
  });

  test("el enlace se llama como el título visible (WCAG 2.5.3) y un clic en la imagen abre la ficha", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(channels(page).first().locator("a")).toHaveText("Estudio de forma 001");
    const box = (await channels(page).first().locator(".wii-channel__media").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(/estudio-de-forma-001$/);
    await context.close();
  });

  test("el teclado recorre los canales en orden y el foco se ve", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe("Saltar al contenido");
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe("Estudio de forma 001");
    const outline = await page.evaluate(() => getComputedStyle(document.querySelector(".wii-channel")!).boxShadow);
    expect(outline).not.toBe("none"); // halo azul de foco
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe("Estudio de forma 002");
    await context.close();
  });

  test("al pasar el cursor el canal se eleva con halo y aparece la segunda imagen", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.mouse.move(2, 2);
    const card = channels(page).first();
    const second = card.locator(".wii-channel__hover");
    await expect(second).toHaveCSS("opacity", "0");
    await card.hover();
    await expect(second).toHaveCSS("opacity", "1");
    await expect(card).toHaveCSS("border-top-color", "rgb(54, 179, 238)");
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
    await context.close();
  });

  test("sin imagen (o si falla) hay un sustituto elegante", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    await context.route("**/ejemplos/**", (route) => route.abort());
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".wii-channel__fallback").first()).toBeVisible();
    await expect(channels(page).first().locator("a")).toHaveText("Estudio de forma 001");
    await context.close();
  });

  test("con movimiento reducido no hay transición", async ({ browser }) => {
    const context = await seenContext(browser, { reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const duration = await channels(page).first().evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThan(0.001);
    await context.close();
  });
});

test.describe("cursor propio", () => {
  test("con puntero fino aparece, reacciona sobre los canales y al clic", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    // Antes de mover el ratón el cursor nativo sigue visible.
    await expect(page.locator("html")).not.toHaveClass(/wii-cursor-on/);
    await page.mouse.move(5, 5);
    await expect(page.locator("html")).toHaveClass(/wii-cursor-on/);
    await expect(page.locator(".wii-cursor")).toHaveAttribute("data-hover", "false");
    const box = (await channels(page).first().boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + 40);
    await expect(page.locator(".wii-cursor")).toHaveAttribute("data-hover", "true");
    await page.mouse.down();
    await expect(page.locator(".wii-cursor")).toHaveAttribute("data-down", "true");
    await page.mouse.up();
    await context.close();
  });

  test("en pantallas táctiles no se activa ni se oculta el cursor nativo", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.movil, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.touchscreen.tap(200, 300);
    await expect(page.locator("html")).not.toHaveClass(/wii-cursor-on/);
    await context.close();
  });
});

test.describe("barra inferior", () => {
  test("fecha en español que coincide con el día actual", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio, locale: "es-ES" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const shown = await page.locator(".wii-date__long").innerText();
    const expected = await page.evaluate(() => {
      const s = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
    expect(shown).toBe(expected);
    expect(shown).toMatch(/^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo), \d{1,2} de [a-záéíóú]+$/);
    await expect(page.locator(".wii-date__time")).toHaveText(/^\d{2}:\d{2}$/);
    await context.close();
  });

  test("los paneles de Menú y Contacto se abren y se cierran (X, Escape, clic fuera)", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });

    const menu = page.getByRole("button", { name: "Menú", exact: true });
    await menu.click();
    const panel = page.getByRole("dialog", { name: "Menú" });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: /Menú principal/ })).toBeVisible();
    await page.getByRole("button", { name: "Cerrar menú" }).click();
    await expect(panel).toHaveCount(0);
    await expect(menu).toBeFocused();

    await page.getByRole("button", { name: "Contacto" }).click();
    const contact = page.getByRole("dialog", { name: "Contacto" });
    await expect(contact).toBeVisible();
    // Sin datos configurados no se inventa ninguno.
    await expect(contact).toContainText("Todavía no hay datos de contacto publicados.");
    await expect(contact.locator("a")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(contact).toHaveCount(0);

    await menu.click();
    await expect(panel).toBeVisible();
    await page.mouse.click(600, 300);
    await expect(panel).toHaveCount(0);
    await context.close();
  });

  test("el botón del menú lleva de vuelta a la cuadrícula desde una ficha", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/referencias/estudio-de-forma-001", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Menú", exact: true }).click();
    await page.getByRole("link", { name: /Menú principal/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(channels(page).first()).toBeVisible();
    await context.close();
  });

  test("en móvil conserva las tres funciones sin desbordes", async ({ browser }) => {
    const context = await seenContext(browser, { viewport: VIEWPORTS.movil });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Menú", exact: true })).toBeVisible();
    await expect(page.locator(".wii-date__short")).toBeVisible();
    await expect(page.getByRole("button", { name: "Contacto" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    await page.getByRole("button", { name: "Contacto" }).click();
    await expect(page.getByRole("dialog", { name: "Contacto" })).toBeVisible();
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
