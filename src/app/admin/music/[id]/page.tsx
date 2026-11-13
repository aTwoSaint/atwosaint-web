import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminAlbum } from "@/lib/data/admin-music";
import { formatDuration } from "@/features/music/links";
import { idSchema } from "@/features/references/schema";
import { ConfirmButton } from "../../ConfirmButton";
import { AlbumForm } from "../AlbumForm";
import { deleteAlbumAction, deleteTrackAction } from "../actions";
import { TrackEditForm } from "../TrackEditForm";
import { TrackUploader } from "../TrackUploader";

const small = "font-mono text-xs uppercase tracking-widest underline-offset-8 hover:underline";

export default async function EditAlbumPage({ params }: PageProps<"/admin/music/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const data = await getAdminAlbum(id);
  if (!data) notFound();
  const { album, tracks } = data;

  return (
    <main className="px-[var(--gutter)] pt-10">
      <div className="mb-10 flex items-baseline justify-between gap-4">
        <h1 className="text-sm font-semibold uppercase tracking-[0.32em]">Editar proyecto</h1>
        <Link href="/admin/music" className={small}>
          ← Música
        </Link>
      </div>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section aria-labelledby="datos">
          <h2 id="datos" className="mb-6 text-lg font-medium">
            Datos
          </h2>
          {album.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={album.coverUrl} alt={album.coverAlt ?? ""} width={160} height={160} className="mb-6 size-40 object-cover" />
          ) : null}
          <AlbumForm album={album} />
          <form action={deleteAlbumAction} className="mt-10">
            <input type="hidden" name="id" value={album.id} />
            <ConfirmButton
              message={`¿Borrar «${album.title}», sus canciones y su portada? No se puede deshacer.`}
              className={`${small} text-accent-ink`}
            >
              Borrar proyecto
            </ConfirmButton>
          </form>
        </section>

        <div className="space-y-16">
          <section aria-labelledby="canciones">
            <h2 id="canciones" className="mb-6 text-lg font-medium">
              Beats ({tracks.length})
            </h2>
            {tracks.length === 0 ? (
              <p className="text-sm text-muted">Todavía no hay beats.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {tracks.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="font-mono text-xs uppercase tracking-widest text-muted">
                        {t.mimeType.includes("wav") || t.mimeType.includes("wave") ? "WAV" : "MP3"} ·{" "}
                        {(t.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                        {formatDuration(t.durationSeconds) ? ` · ${formatDuration(t.durationSeconds)}` : ""}
                        {t.buyUrl ? " · con enlace de compra" : ""}
                      </p>
                      <audio controls preload="none" src={t.audioUrl} className="mt-2 h-8 w-full max-w-xs" />
                      <TrackEditForm track={t} />
                    </div>
                    <form action={deleteTrackAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton message={`¿Borrar el beat «${t.title}» y su archivo de audio? No se puede deshacer.`} className={`${small} text-accent-ink`}>
                        Borrar
                      </ConfirmButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="anadir">
            <h2 id="anadir" className="mb-6 text-lg font-medium">
              Añadir beat
            </h2>
            <TrackUploader albumId={album.id} />
          </section>
        </div>
      </div>
    </main>
  );
}
