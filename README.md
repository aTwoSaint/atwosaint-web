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
npm run build
```

Requiere Node.js 22. Copia `.env.example` a `.env.local` cuando se necesiten variables.

## Estructura

```
src/app/            Rutas
src/components/     Componentes (ui/ genéricos, references/ específicos)
src/features/       Lógica por funcionalidad
src/lib/            Datos, validación y configuración
src/styles/         Tokens de diseño
tests/              Pruebas
docs/               Decisiones y notas
```

## Estado

Fase 2 (entorno) completada. Fase 3 (sistema de diseño e interfaz de Referencias) en revisión, con contenido de ejemplo. Siguiente: Fase 4 (base de datos, imágenes y panel de administración). Detalles en [docs/decisiones.md](docs/decisiones.md) y [docs/direccion-visual.md](docs/direccion-visual.md).
