# Seguridad de ATWOSAINT

Este documento explica qué está protegido, cómo, y **qué tienes que mantener tú** (lo que no se puede hacer desde el código).

## 1. Quién puede hacer qué

| Quién | Puede | No puede |
| --- | --- | --- |
| Cualquier visitante | Ver la web y escuchar lo publicado | Escribir en la base de datos, subir archivos, entrar en `/admin` |
| Administrador (tú, con correo + contraseña) | Crear/editar/borrar referencias, álbumes y canciones | Ejecutar código ni tocar nada fuera de esas tablas |
| Quien tenga acceso a tu cuenta de GitHub/Vercel/Neon | **Todo** (código, datos, secretos) | — |

La base de datos **no está abierta a internet sin credenciales**: solo se entra con la cadena `DATABASE_URL`, que vive únicamente en las variables de entorno de Vercel. El código del repositorio es público, pero **no contiene ningún secreto** (se ha revisado todo el historial y GitHub tiene activado el escaneo de secretos con bloqueo de pushes).

El punto más débil de cualquier proyecto es la cuenta de quien lo administra, no el código: por eso lo más importante de este documento es la sección 4.

## 2. Qué protege el código

- **Acceso al admin**: contraseña con scrypt (parámetros OWASP), comparaciones en tiempo constante, mensaje de error genérico (no revela si falló el correo o la contraseña).
- **Freno a la fuerza bruta**: tras 5 intentos fallidos en 15 minutos desde la misma conexión, se rechaza el acceso sin ni siquiera comprobar la contraseña. Solo se guarda un identificador anónimo (HMAC de la IP), nunca la IP ni la contraseña. Requiere la migración `0003` (si falta, el acceso sigue funcionando pero sin este freno).
- **Sesión**: token JWT firmado (HS256) de 8 h, en cookie `__Host-` + `HttpOnly` + `Secure` + `SameSite=Strict`. Cerrar sesión la borra; cambiar `AUTH_SECRET` cierra todas las sesiones a la vez.
- **Doble barrera**: `proxy.ts` redirige `/admin/*` sin sesión y, además, **cada página y cada acción** vuelve a comprobar la sesión (`requireAdmin`). La subida de audio (`/api/admin/music/upload`) responde 401 sin sesión.
- **CSRF**: las acciones de servidor de Next.js solo aceptan peticiones del mismo origen y la cookie es `SameSite=Strict`.
- **Base de datos**: solo consultas parametrizadas (Drizzle); no hay SQL construido con texto del usuario. La web pública solo **lee**.
- **Subidas**: las imágenes se revalidan y se reconvierten con `sharp` (límite de tamaño y de píxeles; no se admite SVG). El audio solo admite mp3/wav ≤ 80 MB, solo en la carpeta `musica/audio/`, con un token de subida de un solo uso emitido solo a administradores; el servidor vuelve a comprobar tipo y tamaño antes de guardarlo.
- **Enlaces de compra**: solo se aceptan `https://` de Traktrain (sin credenciales en la URL); si un beat no tiene enlace válido, el botón usa el perfil general.
- **Cabeceras**: CSP (solo recursos propios y de nuestro almacén de Blob; sin plugins, sin incrustar la web en otra, sin enviar formularios a otros sitios), HSTS, `nosniff`, `X-Frame-Options: DENY`, política de referrer y de permisos. No se anuncia la tecnología del servidor.
- **Dependencias**: `npm audit` en la CI (falla con vulnerabilidades altas), Dependabot semanal (npm y GitHub Actions) y análisis CodeQL en cada pull request.

## 2.1. Lo que NO cubre el código

- Si alguien roba tu contraseña **o** el acceso a tu cuenta de Vercel/Neon/GitHub, el código no puede evitarlo.
- Los audios subidos a Vercel Blob tienen **URL pública**: quien tenga el enlace puede descargarlos. Sube versiones de previsualización (con etiqueta de voz, recortadas o de menor calidad) y entrega los archivos finales por Traktrain.
- La CSP permite scripts en línea (necesario para Next.js): reduce el daño de un fallo, pero no sustituye a no tenerlo.

## 3. Cómo se protege el código fuente (GitHub)

Ya activo: escaneo de secretos con **push protection** (GitHub bloquea un push que contenga una clave), Dependabot y CodeQL (por los archivos de `.github/`). Hay que activar a mano, porque no se puede desde el código (pasos en la sección 4, puntos 1 y 2 de GitHub): la protección de la rama `main` y las alertas/actualizaciones de seguridad de Dependabot.

## 4. Lo que tienes que hacer tú (en orden de importancia)

**En GitHub** (repositorio → *Settings*):
- **Branches → Add branch ruleset / protection rule** para `main`: marcar *Require a pull request before merging*, *Require status checks to pass* (añadir `check` y `e2e`) y *Block force pushes*. Así `main` no se puede reescribir ni borrar y nada entra sin pasar la CI.
- **Code security → Dependabot**: activar *Dependabot alerts* y *Dependabot security updates*.

1. **Verificación en dos pasos (2FA) en GitHub, Vercel, Neon, tu correo y el proveedor del dominio.** Es, con diferencia, lo que más protege. Mejor con app autenticadora o llave de seguridad que con SMS.
2. **Contraseña del admin**: larga (16+ caracteres), única y generada por un gestor de contraseñas. Recomendado: guardar solo su **hash** (`npm run admin:hash`) en `ADMIN_PASSWORD_HASH` y borrar `ADMIN_PASSWORD` de Vercel.
3. **Rotar los secretos que se hayan compartido alguna vez fuera de Vercel** (por ejemplo, la cadena de Neon que se pegó en un chat): en Neon → Roles → *Reset password*; en Vercel → Storage → Blob → regenerar el token; después actualizar las variables en Vercel y volver a desplegar. Si dudas, rótalos.
4. **Variables de entorno en Vercel**: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SECRET` y la contraseña marcadas como *Sensitive*. Nunca en el código ni en capturas.
5. **Vercel → Settings → Deployment Protection**: activar *Vercel Authentication* para los despliegues de *Preview*, para que las copias de prueba de cada PR no sean públicas.
6. **Neon**: no hace falta abrirla a nadie más. Opcional y recomendable a medio plazo: crear un rol de base de datos propio para la web (permisos solo de lectura/escritura sobre las tablas, sin poder crear ni borrar tablas) y reservar el rol propietario para las migraciones.
7. **Límite de peticiones en Vercel** (Firewall → Rules → *Rate limit* sobre `/admin/login`): capa extra además del freno incorporado.
8. **Aplicar la migración `drizzle/0003_login_attempts.sql`** en el editor SQL de Neon (solo crea una tabla nueva).
9. **Revisar quién tiene acceso** al proyecto de Vercel, al repositorio y a Neon cuando añadas colaboradores, y quitarlo cuando ya no haga falta.
10. **Aceptar las PR de Dependabot** cuando lleguen (pasan la CI solas).

## 5. Si sospechas que algo se ha comprometido

1. Cambia `AUTH_SECRET` en Vercel (cierra todas las sesiones) y vuelve a desplegar.
2. Resetea la contraseña del rol en Neon y regenera el token de Blob; actualiza Vercel.
3. Cambia la contraseña del admin y revisa en `/admin` que no haya contenido que no reconozcas.
4. Revisa en GitHub → Settings → Security log y en Vercel → Activity los accesos recientes.
