"use client";

import { useActionState } from "react";
import { createReferenceAction } from "./actions";
import type { ActionState } from "@/features/references/schema";

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

export function ReferenceForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createReferenceAction,
    {},
  );
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-1">
        <span className={label}>Imagen principal</span>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className={field}
        />
        <FieldError message={e.image} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Segunda imagen (opcional, aparece al pasar el cursor)</span>
        <input
          name="hoverImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className={field}
        />
      </label>

      <label className="block space-y-1">
        <span className={label}>Título</span>
        <input
          name="title"
          required
          maxLength={80}
          defaultValue={v.title}
          className={field}
        />
        <FieldError message={e.title} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Descripción</span>
        <textarea
          name="description"
          required
          maxLength={600}
          rows={4}
          defaultValue={v.description}
          className={field}
        />
        <FieldError message={e.description} />
      </label>

      <label className="block space-y-1">
        <span className={label}>Texto alternativo de la imagen</span>
        <input
          name="alt"
          required
          maxLength={200}
          defaultValue={v.alt}
          placeholder="Describe lo que se ve, para lectores de pantalla"
          className={field}
        />
        <FieldError message={e.alt} />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className={label}>Categoría (opcional)</span>
          <input
            name="category"
            maxLength={40}
            defaultValue={v.category}
            className={field}
          />
          <FieldError message={e.category} />
        </label>
        <label className="block space-y-1">
          <span className={label}>Estado</span>
          <select
            name="status"
            defaultValue={v.status ?? "published"}
            className={field}
          >
            <option value="published">Publicada</option>
            <option value="draft">Borrador (oculta)</option>
          </select>
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-accent-ink">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm">
          Referencia añadida.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Añadir referencia"}
      </button>
      <p className="text-xs text-muted">
        JPG, PNG, WebP o AVIF. Máximo 4 MB entre las dos imágenes. Se recomprimen a
        WebP y se eliminan los metadatos.
      </p>
    </form>
  );
}
