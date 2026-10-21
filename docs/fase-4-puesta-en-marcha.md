# Fase 4 — Puesta en marcha

El código está listo, pero no se ha podido probar contra Neon ni Vercel Blob (el entorno de desarrollo no tiene acceso a esos servicios). Estos pasos los hace el propietario del proyecto, **en este orden y antes de fusionar el pull request**; si no, el despliegue de Vercel fallará al compilar porque la base de datos aún no tiene las tablas.

## 1. Rotar la contraseña de la base de datos

La cadena de conexión se compartió por chat, así que debe considerarse comprometida.

1. Neon → proyecto → **Roles** → `neondb_owner` → **Reset password**.
2. Copia la nueva cadena de conexión (la variante *pooled*). No la pegues en chats ni en archivos del repositorio.

## 2. Crear las tablas

Opción A (la más sencilla): en Neon → **SQL Editor**, pega el contenido de `drizzle/0000_init.sql` y ejecútalo.

Opción B (desde un ordenador con Node 22): `DATABASE_URL="…" npm run db:migrate`.

Elige una sola; no las mezcles.

## 3. Crear el almacén de imágenes

Vercel → proyecto `atwosaint-web` → **Storage** → **Create** → **Blob**, con acceso **público**. Conéctalo al proyecto: Vercel añade `BLOB_READ_WRITE_TOKEN` automáticamente.

## 4. Generar el hash de la contraseña de administrador

Con Node 22 y el repositorio clonado: `npm run admin:hash`. Pide la contraseña (mínimo 12 caracteres, sin mostrarla) y escribe una línea `ADMIN_PASSWORD_HASH=…`. Copia solo el valor. No compartas la contraseña con nadie, tampoco con Claude.

## 5. Variables de entorno en Vercel

Settings → Environment Variables (Production y Preview):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Cadena *pooled* de Neon con la contraseña nueva |
| `BLOB_READ_WRITE_TOKEN` | Lo añade Vercel al conectar el almacén |
| `ADMIN_EMAIL` | Correo del administrador |
| `ADMIN_PASSWORD_HASH` | El hash del paso 4 |
| `AUTH_SECRET` | Cadena aleatoria de 32+ caracteres (`openssl rand -base64 48`) |

No definas `USE_SAMPLE_DATA` en Vercel.

## 6. Desplegar y comprobar

1. Fusiona el pull request. Vercel compila y despliega.
2. Entra en `/admin/login` con el correo y la contraseña.
3. Añade una referencia de prueba y comprueba que aparece en la home y en su ficha.
4. Prueba Ocultar y Borrar.
5. Cierra sesión y confirma que `/admin` redirige al acceso.

## 7. Limitar los intentos de acceso (recomendado)

Vercel → proyecto → **Firewall** → regla personalizada: *Rate limit* sobre la ruta `/admin/login` (por ejemplo, 10 peticiones por minuto por IP). El plan Hobby admite hasta 3 reglas personalizadas. El código no limita intentos por sí mismo.

## Límites conocidos

- **Tamaño de subida:** 4 MB entre las dos imágenes (Vercel admite unos 4,5 MB por petición). Se recomprimen a WebP y se eliminan los metadatos EXIF. Para fotos más pesadas habría que pasar a subidas directas desde el navegador.
- **Sin edición ni reordenación:** el panel permite añadir, ocultar/publicar y borrar. Editar textos y ordenar se añadirán después.
- **Una base de datos para todo:** las vistas previas de Vercel usan la misma base que producción. Para separarlas se puede crear una rama de Neon para Preview.
- **Sesión:** dura 8 horas. Cambiar `AUTH_SECRET` cierra todas las sesiones.
