# Decisiones del proyecto

Fecha: 13/10/2026.

| Tema | Decisión |
|---|---|
| Repositorio | `aTwoSaint/atwosaint-web` |
| Stack | Next.js + TypeScript + Tailwind CSS |
| Base de datos | PostgreSQL (Neon, plan gratuito), desde el inicio (Fase 4) |
| Imágenes | Vercel Blob (Cloudflare R2 descartado: pide tarjeta) |
| Administración | Una sola cuenta de administrador; ruta privada `/admin` con formulario para añadir referencias (imagen, título, descripción) |
| Hosting | Vercel Hobby mientras la web sea personal |
| Dirección visual | Propia, inspirada en las referencias, sin copiar su identidad; se propone en la Fase 3 |

## Avisos

- **Uso comercial:** el plan Hobby de Vercel es solo para uso personal no comercial. Antes de vender ropa o beats hay que pasar a un plan de pago o cambiar de hosting.
- **Dependencias:** `npm audit` informa de vulnerabilidades altas en la cadena de linting (`braces` → `eslint-config-next`). Solo afectan a herramientas de desarrollo. El arreglo automático degradaría `eslint-config-next` a la versión 14, por lo que no se aplica. Se revisará al actualizar. CI audita solo las dependencias de producción.
- **Contenido de producción:** no usar imágenes ni recursos de las webs de referencia.
