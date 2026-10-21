# Fase 4 — Puesta en marcha

El código está listo, pero no se ha podido probar contra Neon ni Vercel Blob (el entorno de desarrollo no tiene acceso a esos servicios). Estos pasos los hace el propietario del proyecto. **Haz los pasos 1 a 4 antes de fusionar el pull request**; si no, el despliegue fallará al compilar.

## Estado

- [x] Tablas creadas en Neon (`drizzle/0000_init.sql` ejecutado en el SQL Editor).
- [x] Contraseña de Neon rotada.
- [x] Almacén Vercel Blob creado (acceso público).
- [x] Regla de límite de intentos sobre `/admin/login`.
- [ ] Variables de entorno en Vercel (paso 1).
- [ ] Desplegar y comprobar (paso 2).
- [ ] Rotar las credenciales que se compartieron por chat (paso 3).

## 1. Añadir las variables de entorno en Vercel

Vercel → proyecto `atwosaint-web` → **Settings** → **Environment Variables**. Para cada fila: pulsa **Add** (o **Create new**), escribe el nombre exacto en *Key*, el valor en *Value*, marca **Production** y **Preview**, activa **Sensitive** si aparece, y guarda. (Los nombres de los botones pueden variar ligeramente.)

| Nombre (Key) | Qué poner (Value) |
|---|---|
| `DATABASE_URL` | La cadena de conexión de Neon con la contraseña **nueva**. En Neon: pulsa **Connect** y copia la cadena con *Pooled connection* activado. |
| `BLOB_READ_WRITE_TOKEN` | Normalmente ya existe: Vercel la añade al conectar el almacén. Compruébalo en la lista; si no está, cópiala desde Storage → tu almacén. |
| `ADMIN_EMAIL` | El correo con el que entrarás al panel. |
| `ADMIN_PASSWORD` | Una contraseña **única** (no reutilizada) de 12 o más caracteres. Escríbela directamente en Vercel; no la compartas por chat. |
| `AUTH_SECRET` | Una cadena aleatoria de 40 o más caracteres. Genérala con el generador de contraseñas de tu gestor (Apple, Google, Bitwarden…) o, si tienes Node, con `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`. No la compartas. |

No definas `USE_SAMPLE_DATA` en Vercel.

`atwosaint_STORE_ID` no hace falta: el código usa el token.

### ADMIN_PASSWORD o ADMIN_PASSWORD_HASH

Hay dos formas de definir la contraseña del administrador:

- **`ADMIN_PASSWORD`** (la más sencilla): la contraseña en texto en una variable *Sensitive* de Vercel. Es aceptable para un sitio personal con una sola cuenta, porque quien puede leer las variables de Vercel ya controla el proyecto.
- **`ADMIN_PASSWORD_HASH`** (recomendada a medio plazo): solo se guarda un hash. Se genera con `npm run admin:hash` en un ordenador con Node 22 y el repositorio (o en GitHub Codespaces). Si defines las dos, manda el hash.

## 2. Desplegar y comprobar

1. Fusiona el pull request (si ya estaba fusionado, en Vercel → **Deployments** → el último → **Redeploy**; las variables nuevas solo se aplican en un despliegue nuevo).
2. Entra en `/admin/login` con el correo y la contraseña.
3. Añade una referencia de prueba y comprueba que aparece en la home y en su ficha.
4. Prueba **Ocultar** y **Borrar**.
5. Cierra sesión y confirma que `/admin` te devuelve al acceso.

Si el despliegue falla, el registro de compilación indica qué variable falta o es incorrecta (sin mostrar su valor).

## 3. Rotar lo que se compartió por chat

La contraseña de Neon y el token de Blob que se pegaron en una conversación quedan en su historial. Cuando todo funcione:

1. **Neon:** Roles → `neondb_owner` → Reset password → actualiza `DATABASE_URL` en Vercel.
2. **Blob:** en Vercel → Storage → tu almacén, regenera el token de lectura/escritura y comprueba que `BLOB_READ_WRITE_TOKEN` tiene el valor nuevo.
3. Redespliega.

A partir de ahora, pega los secretos solo en Vercel.

## Límites conocidos

- **Tamaño de subida:** 4 MB entre las dos imágenes (Vercel admite unos 4,5 MB por petición). Se recomprimen a WebP y se eliminan los metadatos EXIF. Para fotos más pesadas habría que pasar a subidas directas desde el navegador.
- **Sin edición ni reordenación:** el panel permite añadir, ocultar/publicar y borrar. Editar textos y ordenar se añadirán después.
- **Una base de datos para todo:** las vistas previas de Vercel usan la misma base que producción. Para separarlas se puede crear una rama de Neon para Preview.
- **Sesión:** dura 8 horas. Cambiar `AUTH_SECRET` cierra todas las sesiones.
- **Intentos de acceso:** los limita la regla del Firewall de Vercel, no el código.
