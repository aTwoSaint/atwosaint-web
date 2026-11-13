"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudio } from "@/features/audio/AudioProvider";
import { PauseIcon, PlayIcon } from "./icons";

/** Qué suena, visible en las demás secciones mientras haya un beat cargado (en Music lo muestra el reproductor). */
export function MiniPlayer() {
  const { track, playing, toggle } = useAudio();
  const pathname = usePathname();
  if (!track || pathname === "/" || pathname.startsWith("/music")) return null;
  return (
    <div className="nv-mini" role="region" aria-label="Now playing" data-night-content>
      <button
        type="button"
        className="nv-mini__btn"
        onClick={() => toggle(track)}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {playing ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
      </button>
      <Link href={`/music/${track.slug}`} className="nv-mini__text">
        <span className="nv-mini__label">{playing ? "Now playing" : "Paused"}</span>
        <span className="nv-mini__title">{track.title}</span>
      </Link>
    </div>
  );
}
