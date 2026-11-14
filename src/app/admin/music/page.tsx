import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { isMissingTable } from "@/lib/data/music";
import { listAdminAlbums, type AdminAlbum } from "@/lib/data/admin-music";
import { KIND_LABELS } from "@/features/music/types";
import { ConfirmButton } from "../ConfirmButton";
import { AlbumForm } from "./AlbumForm";
import { DbUpgradeBanner } from "./DbUpgradeBanner";
import { deleteAlbumAction, toggleAlbumStatusAction } from "./actions";

const small = "font-mono text-xs uppercase tracking-widest underline-offset-8 hover:underline";

export default async function AdminMusicPage() {
  await requireAdmin();

  let items: AdminAlbum[] = [];
  let missing = false;
  try {
    items = await listAdminAlbums();
  } catch (error) {
    if (!isMissingTable(error)) throw error;
    missing = true;
  }

  return (
    <main className="px-[var(--gutter)] pt-10">
      <div className="mb-10 flex items-baseline justify-between gap-4">
        <h1 className="text-sm font-semibold uppercase tracking-[0.32em]">Administración · Música</h1>
        <div className="flex items-baseline gap-6">
          <Link href="/admin" className={small}>
            Referencias
          </Link>
          <Link href="/" className={small}>
            Ver web
          </Link>
        </div>
      </div>

      <DbUpgradeBanner />

      {missing ? (
        <p role="alert" className="mb-10 max-w-2xl border border-accent-ink p-4 text-sm">
          Faltan las tablas de música en la base de datos. Abre el editor SQL de Neon y ejecuta el contenido del archivo{" "}
          <code>drizzle/0001_cloudy_quasimodo.sql</code> (solo crea tablas nuevas; no toca las referencias). Después
          recarga esta página.
        </p>
      ) : null}

      <div className="grid gap-16 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section aria-labelledby="nuevo">
          <h2 id="nuevo" className="mb-6 text-lg font-medium">
            Nuevo proyecto
          </h2>
          <p className="mb-6 max-w-md text-sm text-muted">
            Primero crea el proyecto (portada y datos). En la pantalla siguiente podrás subir los mp3/wav de cada beat con su
            BPM, tonalidad y enlace de Traktrain.
          </p>
          <AlbumForm />
        </section>

        <section aria-labelledby="existentes">
          <h2 id="existentes" className="mb-6 text-lg font-medium">
            Proyectos ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted">Todavía no hay ninguno.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-4 py-3">
                  {item.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverUrl} alt={item.coverAlt ?? ""} width={48} height={48} className="size-12 shrink-0 object-cover" />
                  ) : (
                    <span aria-hidden className="grid size-12 shrink-0 place-items-center bg-line font-mono text-xs">
                      ♪
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted">
                      {KIND_LABELS[item.kind]} · {item.trackCount} canciones ·{" "}
                      {item.status === "published" ? "Publicado" : "Borrador"}
                    </p>
                  </div>
                  <Link href={`/admin/music/${item.id}`} className={small}>
                    Editar
                  </Link>
                  <form action={toggleAlbumStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value={item.status === "published" ? "draft" : "published"} />
                    <button type="submit" className={small}>
                      {item.status === "published" ? "Ocultar" : "Publicar"}
                    </button>
                  </form>
                  <form action={deleteAlbumAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmButton
                      message={`¿Borrar «${item.title}», sus canciones y su portada? No se puede deshacer.`}
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
