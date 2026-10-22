# Fase 5 · Pruebas, accesibilidad, seguridad y rendimiento

## Qué se ha comprobado
- **Unitarias (Vitest):** 50 pruebas (contraseñas, sesión, credenciales, esquemas, procesado de imágenes, slugs).
- **E2E (Playwright + axe, Chromium real):** 34 pruebas contra la build de producción con contenido de ejemplo.
  - axe WCAG 2.2 AA + buenas prácticas en 4 vistas (inicio, ficha, acceso, 404) × claro/oscuro × móvil/escritorio: **0 violaciones**.
  - Rejilla 2/3/3/4 columnas sin desbordes horizontales.
  - Tarjetas: clic en la imagen, orden de tabulación, segunda imagen al pasar el cursor, `prefers-reduced-motion`.
  - Cabeceras de seguridad, 404, `robots.txt`.
  - Acceso: `/admin` sin sesión → 307, cookie falsificada rechazada, mensaje genérico idéntico para correo o contraseña erróneos, correo conservado, cookies HttpOnly/Secure/SameSite=Strict.
- **Dependencias:** `npm audit --omit=dev` → 0 vulnerabilidades.

## Problemas encontrados y corregidos
1. Nombre accesible de la tarjeta no coincidía con el título visible (WCAG 2.5.3) → patrón de enlace extendido sobre el título.
2. Texto de acento con poco contraste → token `--accent-ink` (claro y oscuro).
3. Bordes de campos con contraste < 3:1 → `--muted`.
4. Tras un acceso fallido se borraba el correo → ahora se conserva (nunca la contraseña).
5. Cabeceras: añadida CSP parcial (`frame-ancestors`, `base-uri`, `form-action`, `object-src`) y COOP.

## Decisiones y límites
- **CSP completa con scripts no se aplica**: exigiría nonces y renderizado dinámico de todo el sitio, perdiendo las páginas estáticas. Se compensa con la CSP parcial.
- **No probado contra Neon ni Vercel Blob reales** (el entorno de desarrollo no tiene acceso). Falta probar en el despliegue: subir una referencia real (≤4 MB en total), editar estado y borrar.
- El error `DATABASE_URL no está definida` en el log de la e2e es esperado: la prueba de acceso correcto llega a `/admin`, que sí consulta la base de datos.
- El job `e2e` de GitHub Actions no se ha podido ejecutar localmente; hay que verlo pasar en el primer PR.
- Lighthouse no se ha ejecutado. SEO/sitemap/`metadataBase` quedan para cuando haya dominio.
- Limitación de intentos de acceso: regla de Vercel Firewall (fuera del código).

## Pendiente fuera del código
- Fusionar el PR de `fase-4-backend` en `main` (producción aún sirve el contenido de ejemplo).
- Rotar la contraseña de Neon y el token de Blob (se compartieron en el chat).
- Pasar de `ADMIN_PASSWORD` a `ADMIN_PASSWORD_HASH` (`npm run admin:hash`).
