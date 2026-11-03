"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { MAX_AUDIO_BYTES } from "@/features/music/schema";
import { slugify } from "@/lib/slug";
import { addTrackAction } from "./actions";

const field =
  "w-full border border-muted bg-transparent px-3 py-2 text-sm outline-none focus:border-ink";
const label = "font-mono text-xs uppercase tracking-widest text-muted";

/** Duración del audio leyendo sus metadatos en el navegador (opcional; si falla, se omite). */
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) ? Math.round(audio.duration) : null);
    audio.onerror = () => done(null);
    audio.src = url;
  });
}

/** Añade una canción: sube el mp3/wav directamente a Vercel Blob y luego guarda la ficha. */
export function TrackUploader({ albumId }: { albumId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("audio");
    const title = String(form.get("title") ?? "").trim();
    const buyUrl = String(form.get("buyUrl") ?? "").trim();
    if (!(file instanceof File) || file.size === 0) return setMessage({ kind: "error", text: "Elige un archivo mp3 o wav." });
    const ext = file.name.toLowerCase().match(/\.(mp3|wav)$/)?.[1];
    if (!ext) return setMessage({ kind: "error", text: "Solo se admiten archivos .mp3 o .wav." });
    if (file.size > MAX_AUDIO_BYTES) return setMessage({ kind: "error", text: "El archivo pesa más de 80 MB." });
    if (!title) return setMessage({ kind: "error", text: "Escribe el nombre de la canción." });

    setBusy(true);
    setProgress(0);
    setMessage(null);
    try {
      const durationSeconds = await readDuration(file);
      const blob = await upload(`musica/audio/${slugify(title)}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/music/upload",
        contentType: ext === "mp3" ? "audio/mpeg" : "audio/wav",
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      const result = await addTrackAction({
        albumId,
        title,
        buyUrl,
        durationSeconds,
        url: blob.url,
        pathname: blob.pathname,
      });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
      } else {
        formRef.current?.reset();
        setMessage({ kind: "ok", text: "Canción añadida." });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setMessage({ kind: "error", text: "La subida ha fallado. Comprueba el archivo y la conexión e inténtalo de nuevo." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className={label}>Archivo (mp3 o wav, hasta 80 MB)</span>
        <input name="audio" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" required className={field} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Nombre de la canción</span>
        <input name="title" required maxLength={100} className={field} />
      </label>
      <label className="block space-y-1">
        <span className={label}>Enlace «Comprar» de BeatStars para esta canción (opcional)</span>
        <input name="buyUrl" type="url" placeholder="https://www.beatstars.com/…" className={field} />
      </label>
      <p className="text-sm text-muted">
        Cualquiera con el enlace puede descargar el archivo. Para vender, sube una versión de previsualización (mp3) y
        deja el wav limpio para BeatStars.
      </p>
      {message ? (
        <p role={message.kind === "error" ? "alert" : "status"} className={message.kind === "error" ? "text-sm text-accent-ink" : "text-sm"}>
          {message.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {busy ? `Subiendo… ${progress}%` : "Añadir canción"}
      </button>
    </form>
  );
}
