import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/session";
import { getBlobEnv } from "@/lib/config/env";
import { AUDIO_PATH_PREFIX, AUDIO_TYPES, MAX_AUDIO_BYTES } from "@/features/music/schema";

/**
 * Concede al navegador del administrador un token de un solo uso para subir un mp3/wav
 * directamente a Vercel Blob (los wav superan el límite de ~4,5 MB de las acciones del servidor).
 * Solo el administrador con sesión válida obtiene token; el tipo, la carpeta y el tamaño
 * quedan fijados en el propio token.
 */
export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  // Las notificaciones de «subida completada» las envía Vercel (sin cookies) y el SDK
  // las verifica por firma; solo la petición de token exige sesión.
  if (body.type === "blob.generate-client-token" && !(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { BLOB_READ_WRITE_TOKEN } = getBlobEnv();
    const result = await handleUpload({
      body,
      request,
      token: BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(AUDIO_PATH_PREFIX) || !/\.(mp3|wav)$/i.test(pathname)) {
          throw new Error("Ruta o extensión no permitida.");
        }
        return {
          allowedContentTypes: [...AUDIO_TYPES],
          maximumSizeInBytes: MAX_AUDIO_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // La canción se guarda al enviar el formulario (addTrackAction); aquí no hace falta nada.
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al preparar la subida de audio", error);
    return NextResponse.json({ error: "No se ha podido preparar la subida." }, { status: 400 });
  }
}
