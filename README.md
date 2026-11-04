# atwosaint-web

Web de ATWOSAINT. Primera versión pública: sección **Referencias** (imagen, nombre y descripción). La arquitectura está pensada para incorporar un ecommerce más adelante sin reescribir lo anterior.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL (Neon) y Vercel Blob para imágenes — Fase 4
- Despliegue en Vercel (plan Hobby mientras la web sea personal y no comercial)

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build      # en local, sin base de datos: USE_SAMPLE_DATA=1 npm run build
```

Requiere Node.js 22. Copia `.env.example` a `.env.local` cuando se necesiten variables.

## Estructura

```
src/app/            Rutas
src/components/     Componentes (ui/ genéricos, references/ específicos)
src/features/       Lógica por funcionalidad
src/lib/            Datos, base de datos, autenticación, imágenes y configuración
src/styles/         Tokens de diseño
tests/              Pruebas
docs/               Decisiones y notas
```

## Music (página de inicio)

`/` muestra la música como un display 3D flotante (CSS puro, sin Three.js) sobre el mismo gris del menú Wii. Al abrir un proyecto: reproductor (mp3/wav), lista de canciones y botón **Comprar** (solo enlaces de BeatStars).

**Gestión (sin tocar código):** `/admin/music` → crear/editar/ocultar/eliminar álbumes, subir portada y añadir o borrar canciones mp3/wav (hasta 80 MB, subida directa a Vercel Blob; las URLs del audio son públicas, usa versiones de previsualización si vendes beats). Mientras no haya nada publicado se ven 6 proyectos de **demostración** marcados como tal (`src/content/music.ts`).

Si hay menos de 6 proyectos, el anillo se completa con huecos grises «Coming Soon». Cada proyecto puede tener una **imagen de hover** (cambia el fondo de la página al pasar el cursor).

**Base de datos:** aplica una vez `drizzle/0001_cloudy_quasimodo.sql` y después `drizzle/0002_hover_image.sql` en el editor SQL de Neon (solo añaden tablas/columna; no tocan `references`). Sin la 0002 la web sigue funcionando (sin imagen de hover), pero el admin de música la necesita. Navegación: botones de la barra inferior (Menú: Music `/`, References `/referencias`, About `/about`).

## Interfaz de References («menú de canales»)

Intro a pantalla completa → menú de canales 4×3 paginado con las referencias reales → ficha. Barra inferior permanente (menú, fecha en español, contacto) y cursor propio en dispositivos con puntero fino. Es solo capa de presentación (`src/app/(wii)`, `src/components/wii`, `src/styles/wii.css`); la administración (`/admin`) conserva su UI funcional.

Contacto (opcional): define `CONTACT_EMAIL` y/o `CONTACT_INSTAGRAM_URL` en Vercel. Sin ellas, el panel de Contacto indica que aún no hay datos. Para probar la paginación en CI se usa `SAMPLE_COUNT=14` (solo con `USE_SAMPLE_DATA=1`).

## Estado

Fases 2 y 3 completadas. Fase 4 (base de datos, imágenes y panel `/admin`) implementada y pendiente de puesta en marcha: ver [docs/fase-4-puesta-en-marcha.md](docs/fase-4-puesta-en-marcha.md). Más detalles en [docs/decisiones.md](docs/decisiones.md) y [docs/direccion-visual.md](docs/direccion-visual.md).
