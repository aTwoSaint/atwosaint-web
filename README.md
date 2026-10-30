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

## Interfaz pública («menú de canales»)

Intro a pantalla completa → menú de canales 4×3 paginado con las referencias reales → ficha. Barra inferior permanente (menú, fecha en español, contacto) y cursor propio en dispositivos con puntero fino. Es solo capa de presentación (`src/app/(wii)`, `src/components/wii`, `src/styles/wii.css`); la administración (`/admin`) conserva su UI funcional.

Contacto (opcional): define `CONTACT_EMAIL` y/o `CONTACT_INSTAGRAM_URL` en Vercel. Sin ellas, el panel de Contacto indica que aún no hay datos. Para probar la paginación en CI se usa `SAMPLE_COUNT=14` (solo con `USE_SAMPLE_DATA=1`).

## Estado

Fases 2 y 3 completadas. Fase 4 (base de datos, imágenes y panel `/admin`) implementada y pendiente de puesta en marcha: ver [docs/fase-4-puesta-en-marcha.md](docs/fase-4-puesta-en-marcha.md). Más detalles en [docs/decisiones.md](docs/decisiones.md) y [docs/direccion-visual.md](docs/direccion-visual.md).
