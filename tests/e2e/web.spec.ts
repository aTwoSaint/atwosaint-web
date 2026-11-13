import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type BrowserContextOptions, type Page } from "@playwright/test";
import { TEST_ADMIN } from "../../playwright.config";

const VIEWPORTS = {
  movil: { width: 390, height: 844 },
  tableta: { width: 820, height: 1180 },
  escritorio: { width: 1440, height: 900 },
} as const;

const OFFICIAL = {
  instagram: "https://www.instagram.com/atwosaint_/",
  youtube: "https://www.youtube.com/@atwosaint2",
  tiktok: "https://www.tiktok.com/@atwosaint",
  traktrain: "https://traktrain.com/atwosaint",
  email: "https://mail.google.com/mail/?view=cm&to=atwosaint2%40gmail.com",
};

/** Contexto sin intro (movimiento reducido) salvo que se pida lo contrario. */
async function open(browser: Browser, viewport: { width: number; height: number } = VIEWPORTS.escritorio, options: BrowserContextOptions = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce", ...options });
  const page = await context.newPage();
  return { context, page };
}

async function violations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  return result.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length}) — ${v.nodes[0]?.html.slice(0, 140)}`);
}

async function noOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
}

const PAGES = [
  "/",
  "/home",
  "/music",
  "/music/demo-02",
  "/archives",
  "/archives/estudio-de-forma-001",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/admin/login",
  "/no-existe",
];

test.describe("accesibilidad (axe, WCAG 2.2 AA)", () => {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    for (const path of PAGES) {
      test(`${path} · ${vpName}`, async ({ browser }) => {
        const { context, page } = await open(browser, viewport);
        await page.goto(path, { waitUntil: "networkidle" });
        expect(await violations(page)).toEqual([]);
        await context.close();
      });
    }
  }
});

test.describe("pantalla de bienvenida", () => {
  test("aparece sola, sin clic, y se retira difuminándose hacia el menú", async ({ browser }) => {
    const context = await browser.newContext({ viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "active");
    await expect(page.locator(".nv-splash")).toBeVisible();
    await expect(page.locator(".nv-splash__logo")).toBeVisible();
    // Sin tocar nada: pasa a "leaving" y luego "seen".
    await expect(page.locator("html")).toHaveAttribute("data-intro", "leaving", { timeout: 4000 });
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen", { timeout: 3000 });
    await expect(page.locator(".nv-splash")).toBeHidden();
    await expect(page.locator(".nv-tile")).toHaveCount(4);
    await context.close();
  });

  test("el contenido está inerte mientras se ve y no reaparece al navegar", async ({ browser }) => {
    const context = await browser.newContext({ viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("[data-night-content]").first().evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen", { timeout: 6000 });
    await page.getByRole("link", { name: /^MUSIC/ }).click();
    await expect(page).toHaveURL(/\/music$/);
    await page.getByRole("link", { name: "Main menu" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
    await expect(page.locator(".nv-splash")).toBeHidden();
    // Recargar en la misma sesión tampoco la repite.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
    await context.close();
  });

  test("un enlace directo a un beat no muestra la intro", async ({ browser }) => {
    const context = await browser.newContext({ viewport: VIEWPORTS.movil });
    const page = await context.newPage();
    await page.goto("/music/demo-02");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
    await expect(page.locator(".nv-info__title")).toBeVisible();
    await context.close();
  });

  test("con movimiento reducido no hay intro", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
    await expect(page.locator(".nv-tile").first()).toBeVisible();
    await context.close();
  });

  test("sin JavaScript el menú se ve igualmente", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: VIEWPORTS.escritorio });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".nv-tile").first()).toBeVisible();
    await context.close();
  });
});

test.describe("menú principal", () => {
  test("cuatro recuadros en una fila en escritorio, con su destino", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/");
    const tiles = page.locator(".nv-tile");
    await expect(tiles).toHaveCount(4);
    const boxes = await tiles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(new Set(boxes.map((b) => Math.round(b.top))).size).toBe(1);
    expect(await tiles.evaluateAll((els) => els.map((e) => e.textContent))).toEqual([
      expect.stringContaining("HOME"),
      expect.stringContaining("MUSIC"),
      expect.stringContaining("ARCHIVES"),
      expect.stringContaining("ABOUT"),
    ]);
    expect(await tiles.evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(["/home", "/music", "/archives", "/about"]);
    await noOverflow(page);
    await context.close();
  });

  test("móvil: rejilla 2 × 2 sin desbordes", async ({ browser }) => {
    const { context, page } = await open(browser, VIEWPORTS.movil);
    await page.goto("/");
    const boxes = await page.locator(".nv-tile").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(new Set(boxes.map((b) => Math.round(b.top))).size).toBe(2);
    expect(new Set(boxes.map((b) => Math.round(b.left))).size).toBe(2);
    await noOverflow(page);
    await context.close();
  });

  test("al pasar el cursor el recuadro se eleva y se ilumina en verde", async ({ browser }) => {
    const { context, page } = await open(browser, VIEWPORTS.escritorio, { reducedMotion: "no-preference" });
    await page.addInitScript(() => sessionStorage.setItem("atw_intro_seen", "1"));
    await page.goto("/");
    const tile = page.locator(".nv-tile").nth(1);
    const before = await tile.evaluate((e) => getComputedStyle(e).borderTopColor);
    await tile.hover();
    await page.waitForTimeout(500);
    const after = await tile.evaluate((e) => ({ color: getComputedStyle(e).borderTopColor, t: getComputedStyle(e).transform }));
    expect(after.color).not.toBe(before);
    expect(after.t).not.toBe("none");
    await context.close();
  });

  test("entrar en una sección muestra la barra inferior con su estado activo", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
    await page.locator(".nv-tile").nth(2).click();
    await expect(page).toHaveURL(/\/archives$/);
    const bar = page.getByRole("navigation", { name: "Main" });
    await expect(bar.getByRole("link", { name: "ARCHIVES" })).toHaveAttribute("aria-current", "page");
    await expect(bar.getByRole("link", { name: "MUSIC" })).not.toHaveAttribute("aria-current", "page");
    await context.close();
  });
});

test.describe("barra inferior", () => {
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    test(`casa, cuatro secciones y contacto, pegada abajo y sin desbordes · ${vpName}`, async ({ browser }) => {
      const { context, page } = await open(browser, viewport);
      await page.goto("/about");
      const bar = page.getByRole("navigation", { name: "Main" });
      await expect(bar.getByRole("link", { name: "Main menu" })).toHaveAttribute("href", "/");
      await expect(bar.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
      for (const label of ["HOME", "MUSIC", "ARCHIVES", "ABOUT"]) await expect(bar.getByRole("link", { name: label })).toBeVisible();
      await expect(bar.getByRole("link", { name: "ABOUT" })).toHaveAttribute("aria-current", "page");
      const box = (await bar.boundingBox())!;
      expect(Math.round(box.y + box.height)).toBe(viewport.height);
      for (const l of await bar.getByRole("link").all()) {
        const b = (await l.boundingBox())!;
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(viewport.width);
      }
      await noOverflow(page);
      await context.close();
    });
  }

  test("la navegación lleva a cada sección y a contacto", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/about");
    const bar = page.getByRole("navigation", { name: "Main" });
    await bar.getByRole("link", { name: "MUSIC" }).click();
    await expect(page).toHaveURL(/\/music/);
    await bar.getByRole("link", { name: "HOME" }).click();
    await expect(page).toHaveURL(/\/home$/);
    await bar.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact");
    await context.close();
  });
});

test.describe("Music", () => {
  test("un enlace directo enfoca ese beat y muestra su ficha, sin reproducir nada", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music/demo-02");
    await expect(page.locator(".nv-info__title")).toHaveText("Low Orbit (demo)");
    await expect(page.locator(".nv-meta")).toContainText("86");
    await expect(page.locator(".nv-meta")).toContainText("A minor");
    await expect(page.locator("audio")).toHaveCount(1);
    expect(await page.locator("audio").evaluate((a: HTMLAudioElement) => a.paused && !a.currentSrc)).toBe(true);
    await expect(page.getByRole("button", { name: "Play Low Orbit (demo)" })).toBeVisible();
    await context.close();
  });

  test("las flechas y el teclado cambian de beat y actualizan la dirección compartible", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music");
    await expect(page.locator(".nv-info__title")).toHaveText("Midnight Static (demo)");
    await page.getByRole("button", { name: "Next beat" }).click();
    await expect(page.locator(".nv-info__title")).toHaveText("Low Orbit (demo)");
    await expect(page).toHaveURL(/\/music\/demo-02$/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/music\/demo-03$/);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/music\/demo-01$/);
    await expect(page.getByRole("button", { name: "Previous beat" })).toBeDisabled();
    await expect(page.locator(".nv-music__count")).toContainText("01 / 06");
    await context.close();
  });

  test("tocar una portada no activa la enfoca; tocar la enfocada reproduce", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music");
    await page.getByRole("button", { name: "Select Low Orbit (demo)" }).click();
    await expect(page.locator(".nv-info__title")).toHaveText("Low Orbit (demo)");
    expect(await page.locator("audio").evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
    await page.getByRole("button", { name: /^Low Orbit \(demo\) — play/ }).click();
    await expect(page.getByRole("button", { name: "Pause Low Orbit (demo)" })).toBeVisible();
    await context.close();
  });

  test("un único reproductor: reproducir, pausar, buscar, y al cambiar de beat el anterior se detiene", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music/demo-01");
    const audio = page.locator("audio");
    await page.getByRole("button", { name: "Play Midnight Static (demo)" }).click();
    await expect(page.getByRole("button", { name: "Pause Midnight Static (demo)" })).toBeVisible();
    expect(await audio.evaluate((a: HTMLAudioElement) => !a.paused || a.currentTime > 0)).toBe(true);
    await expect(page.locator(".nv-player__range")).toBeEnabled();
    await expect(page.locator(".nv-player__status")).toContainText(/Now playing|Loading/);
    await page.getByRole("button", { name: "Pause Midnight Static (demo)" }).click();
    expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
    await page.getByRole("button", { name: "Play Midnight Static (demo)" }).click();
    await page.getByRole("button", { name: "Next beat" }).click();
    expect(await audio.evaluate((a: HTMLAudioElement) => a.paused && !a.getAttribute("src"))).toBe(true);
    await expect(page.getByRole("button", { name: "Play Low Orbit (demo)" })).toBeVisible();
    await expect(audio).toHaveCount(1);
    await context.close();
  });

  test("la música sigue al cambiar de sección, con mini reproductor para pausarla", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music/demo-01");
    await page.getByRole("button", { name: "Play Midnight Static (demo)" }).click();
    await expect(page.getByRole("button", { name: "Pause Midnight Static (demo)" })).toBeVisible();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "ABOUT" }).click();
    const mini = page.getByRole("region", { name: "Now playing" });
    await expect(mini).toBeVisible();
    await expect(mini).toContainText("Midnight Static (demo)");
    await mini.getByRole("button", { name: /^Pause/ }).click();
    expect(await page.locator("audio").evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
    await mini.getByRole("link").click();
    await expect(page).toHaveURL(/\/music\/demo-01$/);
    await context.close();
  });

  test("BUY BEAT abre Traktrain de forma segura: enlace propio o, si falta, el perfil", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music/demo-01"); // sin enlace propio
    let buy = page.getByRole("link", { name: /^BUY BEAT/ });
    await expect(buy).toHaveAttribute("href", OFFICIAL.traktrain);
    await expect(buy).toHaveAttribute("target", "_blank");
    expect(await buy.getAttribute("rel")).toMatch(/noopener/);
    expect(await buy.getAttribute("rel")).toMatch(/noreferrer/);
    await page.goto("/music/demo-02");
    buy = page.getByRole("link", { name: /^BUY BEAT/ });
    await expect(buy).toHaveAttribute("href", /^https:\/\/traktrain\.com\//);
    await context.close();
  });

  test("desde un Reel en el móvil: escuchar y comprar están a la vista, sin desplazarse", async ({ browser }) => {
    const { context, page } = await open(browser, VIEWPORTS.movil, { isMobile: true, hasTouch: true });
    await page.goto("/music/demo-02");
    const bar = (await page.getByRole("navigation", { name: "Main" }).boundingBox())!;
    for (const target of [page.getByRole("button", { name: "Play Low Orbit (demo)" }), page.getByRole("link", { name: /^BUY BEAT/ })]) {
      const b = (await target.boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y + b.height).toBeLessThanOrEqual(bar.y);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    await noOverflow(page);
    // Un toque para reproducir.
    await page.getByRole("button", { name: "Play Low Orbit (demo)" }).tap();
    await expect(page.getByRole("button", { name: "Pause Low Orbit (demo)" })).toBeVisible();
    await context.close();
  });

  test("deslizar con el dedo cambia de beat", async ({ browser }) => {
    const { context, page } = await open(browser, VIEWPORTS.movil, { isMobile: true, hasTouch: true });
    await page.goto("/music/demo-02");
    const reel = (await page.locator(".nv-reel").boundingBox())!;
    const y = reel.y + 120;
    await page.mouse.move(reel.x + 300, y);
    await page.mouse.down();
    await page.mouse.move(reel.x + 150, y, { steps: 8 });
    await page.mouse.up();
    await expect(page.locator(".nv-info__title")).toHaveText("Concrete Dreams (demo)");
    await context.close();
  });

  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    test(`sin desbordes y con la barra y las flechas bien colocadas · ${vpName}`, async ({ browser }) => {
      const { context, page } = await open(browser, viewport);
      await page.goto("/music/demo-03");
      await noOverflow(page);
      const reel = (await page.locator(".nv-reel").boundingBox())!;
      expect(reel.x).toBeGreaterThanOrEqual(0);
      expect(reel.x + reel.width).toBeLessThanOrEqual(viewport.width + 1);
      await context.close();
    });
  }

  test("al enfocar un beat, el fondo de la página muestra su imagen", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/music/demo-01");
    await expect(page.locator(".nv-music__bgimg")).toBeVisible();
    const src = await page.locator(".nv-music__bgimg").getAttribute("src");
    await page.getByRole("button", { name: "Next beat" }).click();
    await expect.poll(async () => page.locator(".nv-music__bgimg").getAttribute("src")).not.toBe(src);
    await context.close();
  });

  test("compartir sin menú del sistema copia el enlace del beat", async ({ browser }) => {
    const { context, page } = await open(browser, VIEWPORTS.escritorio, { permissions: ["clipboard-read", "clipboard-write"] });
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined }));
    await page.goto("/music/demo-02");
    await page.getByRole("button", { name: "Share Low Orbit (demo)" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/music\/demo-02$/);
    await context.close();
  });

  test("la página de un beat tiene metadatos para compartir", async ({ request }) => {
    const html = await (await request.get("/music/demo-02")).text();
    expect(html).toContain("Low Orbit (demo)");
    expect(html).toMatch(/property="og:title"/);
    expect(html).toMatch(/rel="canonical"/);
  });
});

test.describe("Home, Archives, About y contacto", () => {
  test("Home enlaza con el beat destacado y con Music", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/home");
    await page.getByRole("link", { name: "Listen to the beats" }).click();
    await expect(page).toHaveURL(/\/music\/demo-01$/);
    await context.close();
  });

  test("Archives muestra todas las referencias en una cuadrícula asimétrica y abre su detalle", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/archives");
    await expect(page.locator(".nv-tile-ref")).toHaveCount(14);
    const sizes = await page.locator(".nv-tile-ref").evaluateAll((els) => els.map((e) => `${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
    expect(new Set(sizes).size).toBeGreaterThan(2);
    await noOverflow(page);
    await page.locator(".nv-tile-ref__link").first().click();
    await expect(page).toHaveURL(/\/archives\/estudio-de-forma-001$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estudio de forma 001");
    await page.getByRole("link", { name: /Back to archives/ }).click();
    await expect(page).toHaveURL(/\/archives$/);
    await context.close();
  });

  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    test(`Archives y su detalle sin desbordes · ${vpName}`, async ({ browser }) => {
      const { context, page } = await open(browser, viewport);
      for (const path of ["/archives", "/archives/estudio-de-forma-002"]) {
        await page.goto(path);
        await noOverflow(page);
      }
      await context.close();
    });
  }

  test("About está en inglés y no añade datos inventados", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/about");
    await expect(page.locator("main")).toContainText("independent creative project based in Spain");
    await expect(page.locator("main")).toContainText("Independent by nature. Creative without boundaries.");
    await context.close();
  });

  test("Contacto: todos los canales con los enlaces oficiales y apertura segura", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/contact");
    for (const href of Object.values(OFFICIAL)) {
      const link = page.locator(".nv-contact").locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute("target", "_blank");
      expect(await link.getAttribute("rel")).toMatch(/noopener/);
    }
    await context.close();
  });
});

test.describe("pie de página y documentos legales", () => {
  for (const path of ["/", "/home", "/music", "/archives", "/about", "/contact", "/privacy"]) {
    test(`redes, contacto y enlaces legales · ${path}`, async ({ browser }) => {
      const { context, page } = await open(browser);
      await page.goto(path);
      const footer = page.locator("footer.nv-footer");
      await expect(footer.getByRole("img", { name: "aTwoSaint" })).toBeVisible();
      for (const href of Object.values(OFFICIAL)) {
        const link = footer.locator(`a[href="${href}"]`);
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute("target", "_blank");
        expect(await link.getAttribute("rel")).toMatch(/noopener/);
      }
      await expect(footer.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
      for (const [name, href] of [["Privacy Policy", "/privacy"], ["Terms of Use", "/terms"], ["Cookie Policy", "/cookies"]]) {
        await expect(footer.getByRole("link", { name })).toHaveAttribute("href", href);
      }
      await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
      await context.close();
    });
  }

  test("los iconos del pie son botones táctiles de al menos 44 px", async ({ browser }) => {
    const { context, page } = await open(browser, VIEWPORTS.movil);
    await page.goto("/about");
    for (const a of await page.locator("footer.nv-footer__social a, .nv-footer__social a").all()) {
      const b = (await a.boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    await context.close();
  });

  test("los documentos legales dicen lo que la web hace de verdad", async ({ browser }) => {
    const { context, page } = await open(browser);
    await page.goto("/cookies");
    await expect(page.locator("main")).toContainText("no analytics, advertising or tracking cookies");
    await expect(page.locator("main")).toContainText("__Host-atw_session");
    // Sin cookies no esenciales no hay banner de consentimiento.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goto("/privacy");
    await expect(page.locator("main")).toContainText("Traktrain");
    await expect(page.locator("main")).toContainText("atwosaint2@gmail.com");
    await page.goto("/terms");
    await expect(page.locator("main")).toContainText("preview for listening only");
    // Visitar la web no crea ninguna cookie.
    await page.goto("/music");
    expect(await context.cookies()).toEqual([]);
    await context.close();
  });
});

test.describe("rutas y cabeceras", () => {
  test("una ficha o un beat inexistentes devuelven 404", async ({ request }) => {
    const res = await request.get("/archives/no-existe");
    expect(res.status()).toBe(404);
    expect((await request.get("/music/no-existe")).status()).toBe(404);
  });

  test("cabeceras de seguridad presentes", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    const csp = h["content-security-policy"];
    for (const d of [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "connect-src 'self' https://vercel.com https://*.public.blob.vercel-storage.com",
    ]) {
      expect(csp).toContain(d);
    }
    expect(csp).not.toMatch(/script-src[^;]*https?:/); // ningún script de otros sitios
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("robots.txt oculta /admin", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Disallow: /admin");
  });

  test("las direcciones antiguas de Referencias redirigen a Archives", async ({ request }) => {
    const a = await request.get("/referencias", { maxRedirects: 0 });
    expect(a.status()).toBe(308);
    expect(a.headers().location).toContain("/archives");
    const b = await request.get("/referencias/estudio-de-forma-001", { maxRedirects: 0 });
    expect(b.status()).toBe(308);
    expect(b.headers().location).toContain("/archives/estudio-de-forma-001");
  });

  test("el HTML público no contiene nombres de secretos ni rutas de administración visibles", async ({ request }) => {
    for (const path of ["/", "/music", "/archives", "/about", "/contact"]) {
      const html = await (await request.get(path)).text();
      for (const word of ["DATABASE_URL", "BLOB_READ_WRITE_TOKEN", "AUTH_SECRET", "ADMIN_PASSWORD"]) {
        expect(html, `${path} contiene ${word}`).not.toContain(word);
      }
    }
  });

  test("las rutas de la API de administración solo aceptan lo previsto", async ({ request }) => {
    expect((await request.get("/api/admin/music/upload")).status()).toBe(405);
    const bad = await request.post("/api/admin/music/upload", { data: "no-json", headers: { "content-type": "application/json" } });
    expect(bad.status()).toBe(400);
  });
});

test.describe("administración", () => {
  test("sin sesión, /admin/music redirige al acceso con un 307", async ({ request }) => {
    const res = await request.get("/admin/music", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toContain("/admin/login");
  });

  test("sin sesión, la subida de audio se rechaza con 401", async ({ request }) => {
    const res = await request.post("/api/admin/music/upload", {
      data: {
        type: "blob.generate-client-token",
        payload: { pathname: "musica/audio/x.mp3", clientPayload: null, multipart: false },
      },
    });
    expect(res.status()).toBe(401);
  });

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
