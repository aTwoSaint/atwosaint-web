"use client";

import { useActionState } from "react";
import type { ActionState } from "@/features/references/schema";
import { updateTrackAction } from "./actions";

const field = "w-full border border-muted bg-transparent px-3 py-2 text-sm outline-none focus:border-ink";
const label = "font-mono text-xs uppercase tracking-widest text-muted";

type Track = {
  id: string;
  title: string;
  buyUrl: string | null;
  bpm: number | null;
  musicalKey: string | null;
  description: string | null;
  releasedOn: string | null;
};

/** Edita la ficha de un beat (nombre, enlace de compra, BPM, tonalidad, fecha y descripción). */
export function TrackEditForm({ track }: { track: Track }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateTrackAction, {});
  const v = (k: string, fallback: string) => state.values?.[k] ?? fallback;
  const err = (k: string) => state.fieldErrors?.[k];
  return (
    <details className="mt-3">
      <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest underline-offset-8 hover:underline">
        Editar ficha
      </summary>
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={track.id} />
        <label className="block space-y-1">
          <span className={label}>Nombre</span>
          <input name="title" required maxLength={100} defaultValue={v("title", track.title)} className={field} />
          {err("title") ? <span role="alert" className="text-sm text-accent-ink">{err("title")}</span> : null}
        </label>
        <label className="block space-y-1">
          <span className={label}>Enlace de Traktrain (opcional)</span>
          <input name="buyUrl" type="url" defaultValue={v("buyUrl", track.buyUrl ?? "")} className={field} />
          {err("buyUrl") ? <span role="alert" className="text-sm text-accent-ink">{err("buyUrl")}</span> : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className={label}>BPM</span>
            <input name="bpm" type="number" min={30} max={300} defaultValue={v("bpm", track.bpm?.toString() ?? "")} className={field} />
            {err("bpm") ? <span role="alert" className="text-sm text-accent-ink">{err("bpm")}</span> : null}
          </label>
          <label className="block space-y-1">
            <span className={label}>Tonalidad</span>
            <input name="musicalKey" maxLength={20} defaultValue={v("musicalKey", track.musicalKey ?? "")} className={field} />
          </label>
          <label className="block space-y-1">
            <span className={label}>Lanzamiento</span>
            <input name="releasedOn" type="date" defaultValue={v("releasedOn", track.releasedOn ?? "")} className={field} />
            {err("releasedOn") ? <span role="alert" className="text-sm text-accent-ink">{err("releasedOn")}</span> : null}
          </label>
        </div>
        <label className="block space-y-1">
          <span className={label}>Descripción</span>
          <textarea name="description" rows={2} maxLength={600} defaultValue={v("description", track.description ?? "")} className={field} />
        </label>
        {state.error ? <p role="alert" className="text-sm text-accent-ink">{state.error}</p> : null}
        {state.ok ? <p role="status" className="text-sm">Guardado.</p> : null}
        <button type="submit" disabled={pending} className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper disabled:opacity-50">
          {pending ? "Guardando…" : "Guardar ficha"}
        </button>
      </form>
    </details>
  );
}
