import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminReferences } from "@/lib/data/admin-references";
import {
  deleteReferenceAction,
  logoutAction,
  toggleStatusAction,
} from "./actions";
import { ConfirmButton } from "./ConfirmButton";
import { ReferenceForm } from "./ReferenceForm";

const small =
  "font-mono text-xs uppercase tracking-widest underline-offset-8 hover:underline";

export default async function AdminPage() {
  await requireAdmin();
  const items = await listAdminReferences();

  return (
    <main className="px-[var(--gutter)] pt-10">
      <div className="mb-10 flex items-baseline justify-between gap-4">
        <h1 className="text-sm font-semibold uppercase tracking-[0.32em]">
          Administración
        </h1>
        <div className="flex items-baseline gap-6">
          <Link href="/" className={small}>
            Ver web
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={small}>
              Salir
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section aria-labelledby="nueva">
          <h2 id="nueva" className="mb-6 text-lg font-medium">
            Nueva referencia
          </h2>
          <ReferenceForm />
        </section>

        <section aria-labelledby="existentes">
          <h2 id="existentes" className="mb-6 text-lg font-medium">
            Referencias ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay ninguna.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbUrl}
                    alt={item.thumbAlt}
                    width={48}
                    height={60}
                    className="h-15 w-12 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {String(item.sortOrder).padStart(3, "0")} ·{" "}
                      {item.status === "published" ? "Publicada" : "Borrador"}
                    </p>
                  </div>
                  <form action={toggleStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={item.status === "published" ? "draft" : "published"}
                    />
                    <button type="submit" className={small}>
                      {item.status === "published" ? "Ocultar" : "Publicar"}
                    </button>
                  </form>
                  <form action={deleteReferenceAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmButton
                      message={`¿Borrar «${item.title}» y sus imágenes? No se puede deshacer.`}
                      className={`${small} text-accent-ink`}
                    >
                      Borrar
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
