"use client";

import { useActionState } from "react";
import { KIND_LABELS, type MusicKind } from "@/features/music/types";
import type { ActionState } from "@/features/references/schema";
import type { AdminAlbum } from "@/lib/data/admin-music";
import { createAlbumAction, updateAlbumAction } from "./actions";

const field =
  "w-full border border-muted bg-transparent px-3 py-2 text-sm outline-none focus:border-ink";
const label = "font-mono text-xs uppercase tracking-widest text-muted";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="text-sm text-accent-ink">
      {message}
    </p>
  ) : null;
}

/** Formulario de proyecto: sirve para crear (sin `album`) y para editar. */
export function AlbumForm({ album }: { album?: AdminAlbum }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    album ? updateAlbumAction : createAlbumAction,
    {},
  );
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const val = (k: string, fallback: string) => (v[k] !== undefined ? v[k] : fallback);

  return (
    <form action={action} className="space-y-5">
      {album ? <input type="hidden" name="id" value={album.id} /> : null}

      <label className="block space-y-1">
        <span className={label}>Portada {album ? "(opcional, sustituye a la actual)" : "(opcional)"}</span>
        <input name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className={field} />
        <FieldError message={e.cover} />
      </label>

      <label className="block space-y-1">
        <span className={label}>
          Imagen de fondo al pasar el cursor {album ? "(opcional, sustituye a la actual)" : "(opcional)"}
        </span>
        <input name="hover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className={field} />
        <span className="block text-xs text-muted">
          Sustituye al fondo gris de la página mientras el cursor está sobre este proyecto. Mejor apaisada (16:9) y no muy clara en la parte baja.
          {album?.hoverUrl ? " Este proyecto ya tiene una." : ""}
        </span>
        <FieldError message={e.hover} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Título</span>
        <input name="title" required maxLength={80} defaultValue={val("title", album?.title ?? "")} className={field} />
        <FieldError message={e.title} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Artista</span>
        <input name="artist" required maxLength={80} defaultValue={val("artist", album?.artist ?? "aTwoSaint")} className={field} />
        <FieldError message={e.artist} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-1">
          <span className={label}>Tipo</span>
          <select name="kind" defaultValue={val("kind", album?.kind ?? "album")} className={field}>
            {(Object.keys(KIND_LABELS) as MusicKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className={label}>Año (opcional)</span>
          <input name="year" inputMode="numeric" maxLength={4} defaultValue={val("year", album?.year?.toString() ?? "")} className={field} />
          <FieldError message={e.year} />
        </label>
      </div>

      <label className="block space-y-1">
        <span className={label}>Descripción (opcional)</span>
        <textarea name="description" rows={3} maxLength={1000} defaultValue={val("description", album?.description ?? "")} className={field} />
        <FieldError message={e.description} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Enlace de Traktrain del proyecto (opcional; sirve de reserva para sus beats)</span>
        <input name="buyUrl" type="url" placeholder="https://traktrain.com/atwosaint/…" defaultValue={val("buyUrl", album?.buyUrl ?? "")} className={field} />
        <FieldError message={e.buyUrl} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Estado</span>
        <select name="status" defaultValue={val("status", album?.status ?? "draft")} className={field}>
          <option value="draft">Borrador (no se ve en la web)</option>
          <option value="published">Publicado</option>
        </select>
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-accent-ink">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm">
          Guardado.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {pending ? "Guardando…" : album ? "Guardar cambios" : "Crear proyecto"}
      </button>
    </form>
  );
}
