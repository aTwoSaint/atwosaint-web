# Rediseño «visión nocturna» — entrega

Estética negro/verde fosforescente, menú de 4 recuadros, barra inferior, Music con una página por instrumental, Archives, About, footer y páginas legales. Sin cambiar de framework ni de base de datos.

## Estructura de rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Splash automático (1,5–2,5 s, configurable) y menú de 4 recuadros |
| `/home` | Inicio de marca: último beat (escuchar/comprar) y accesos |
| `/music`, `/music/[slug]` | Carrusel; cada beat tiene su enlace compartible con vista previa social. Salta el splash |
| `/archives`, `/archives/[slug]` | Antes «Referencias» (`/referencias*` redirige con 301) |
| `/about`, `/contact`, `/privacy`, `/terms`, `/cookies` | Marca (en inglés), contacto sin formulario y legales |

## Music: de un Reel a comprar

Enlace al beat → aparece ya enfocado → **1 toque** (portada o ▶) para escuchar → **1 toque** en *BUY BEAT*. No hay autoplay. Un único `<audio>` global (sobrevive a la navegación, mini-reproductor fuera de Music), controles de pantalla de bloqueo (Media Session), *Share*, teclado (←/→, espacio) y `prefers-reduced-motion`. El botón de compra usa el enlace Traktrain del beat; si falta, el del proyecto; si falta, `https://traktrain.com/atwosaint`. Los enlaces externos llevan `noopener noreferrer`. Cada canción de un proyecto publicado es un beat y hereda su portada y la imagen de fondo (hover).

## Base de datos — migración 0004 (aditiva)

`drizzle/0004_beat_details.sql` añade a `tracks` columnas **opcionales**: `slug`, `bpm`, `musical_key`, `description`, `released_on`. No borra ni cambia nada. Los beats antiguos usan su `id` como dirección hasta que se les asigne slug.

**Antes de aplicarla, copia de seguridad** (Neon → Branches → crear una rama es instantáneo y gratis; sirve de copia y de recuperación). Pega en el SQL Editor **el contenido** (no el nombre del archivo):

```sql
ALTER TABLE "tracks" ADD COLUMN "slug" text;
ALTER TABLE "tracks" ADD COLUMN "bpm" integer;
ALTER TABLE "tracks" ADD COLUMN "musical_key" text;
ALTER TABLE "tracks" ADD COLUMN "description" text;
ALTER TABLE "tracks" ADD COLUMN "released_on" date;
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_slug_unique" UNIQUE("slug");
```

Recuperación: crear una rama de Neon desde un instante anterior o, para deshacer solo esto, `ALTER TABLE tracks DROP COLUMN slug, DROP COLUMN bpm, DROP COLUMN musical_key, DROP COLUMN description, DROP COLUMN released_on;`. La web pública sigue funcionando sin la 0004, pero el **admin de música la necesita**.

La `0003` (tabla `login_attempts`) también está pendiente si no la aplicaste:

```sql
CREATE TABLE "login_attempts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "key" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);
CREATE INDEX "login_attempts_key_created_idx" ON "login_attempts" USING btree ("key","created_at");
```

## Variables de entorno

Sin cambios obligatorios. Opcional: `NEXT_PUBLIC_SPLASH_MS`. `CONTACT_EMAIL` y `CONTACT_INSTAGRAM_URL` ya no se usan (los datos oficiales están en `src/content/site.ts`).

## Desplegar en Vercel

1. Aplica 0003 y 0004 en Neon (arriba). 2. Fusiona la PR (incluye la de seguridad #11 si sigue abierta: esta rama parte de ella). 3. Vercel despliega solo desde `main`. 4. Comprueba `/music`, `/archives` y `/admin/music` (crear un beat con enlace Traktrain).

## Legal: qué recoge realmente la web

No hay analítica, publicidad, formularios públicos ni cookies para visitantes. Solo `sessionStorage` (`atw_intro_seen`, para no repetir el splash; no se envía a ningún sitio) y, al entrar el administrador, cookies de sesión. El alojamiento (Vercel) registra direcciones IP en sus registros técnicos. Por eso no hay banner de consentimiento. **Falta tu información de titular** (nombre/razón social, NIF, domicilio) en `legalHolder` de `src/content/site.ts`; las páginas legales avisan de ello. Los textos son una base honesta, no asesoramiento jurídico: conviene que los revise un profesional antes de vender.

## Seguridad (resumen de este cambio)

Enlaces de compra validados a Traktrain (https, sin credenciales), nuevos campos validados con zod, edición de beats con `requireAdmin()`, contacto sin formulario (sin spam ni datos), redirecciones con 301 y CSP intacta. Pruebas: 66 unitarias y 96 e2e (axe WCAG 2.2 AA, 3 tamaños, 401/307 sin sesión, cookie falsificada, cabeceras). **No cubre**: cuentas (GitHub/Vercel/Neon sin 2FA), audios con URL pública, y la CSP mantiene `'unsafe-inline'` por Next.js.

## GitHub (solo análisis, nada cambiado)

`aTwoSaint/atwosaint-web` es **público**, sin GitHub Pages, sin `vercel.json`, `main` sin protección, historial (23 commits) sin patrones de secretos. Hacerlo privado: Vercel (plan Hobby) **sí** despliega repos privados de cuentas personales, pero la integración debe seguir autorizada; la CI de GitHub Actions gasta minutos (2000/mes en privados); CodeQL y el escaneo de secretos gratuitos requieren repo público o GitHub Advanced Security. Ojo: privado no oculta el JS que llega al navegador. La cuenta aparece **suspendida**: hasta resolverlo con GitHub, Vercel no recibirá pushes nuevos.
