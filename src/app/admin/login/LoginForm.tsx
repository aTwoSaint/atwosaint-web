"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import type { ActionState } from "@/features/references/schema";

const field =
  "w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-1">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Correo
        </span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={field}
        />
      </label>
      <label className="block space-y-1">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
