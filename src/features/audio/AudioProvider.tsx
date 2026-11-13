"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  slug: string;
  cover?: string;
};

type AudioState = {
  track: PlayerTrack | null;
  playing: boolean;
  loading: boolean;
  error: boolean;
  current: number;
  duration: number;
  /** Reproduce (o reanuda) un beat. Solo se llama desde una acción del usuario. */
  play: (track: PlayerTrack) => void;
  pause: () => void;
  toggle: (track: PlayerTrack) => void;
  seek: (seconds: number) => void;
  /** Detiene y descarta el audio actual (al cambiar de beat). */
  stop: () => void;
};

const Ctx = createContext<AudioState | null>(null);

/**
 * Único reproductor de la web: un solo <audio> para toda la sesión, así nunca suenan dos beats a la vez
 * y la música sigue al navegar entre secciones. No hay autoplay: nada suena sin una pulsación del usuario.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback((next: PlayerTrack) => {
    const a = el.current;
    if (!a) return;
    setError(false);
    if (a.dataset.id !== next.id) {
      a.pause();
      a.src = next.src;
      a.dataset.id = next.id;
      setTrack(next);
      setCurrent(0);
      setDuration(0);
      setLoading(true);
    }
    void a.play().catch(() => {
      // El navegador puede rechazar la reproducción (red, formato); se avisa sin romper nada.
      setPlaying(false);
      setLoading(false);
      setError(true);
    });
  }, []);

  const pause = useCallback(() => el.current?.pause(), []);

  const stop = useCallback(() => {
    const a = el.current;
    if (!a) return;
    a.pause();
    a.removeAttribute("src");
    a.load();
    delete a.dataset.id;
    setTrack(null);
    setPlaying(false);
    setLoading(false);
    setCurrent(0);
    setDuration(0);
  }, []);

  const toggle = useCallback(
    (next: PlayerTrack) => {
      const a = el.current;
      if (a && a.dataset.id === next.id && !a.paused) a.pause();
      else play(next);
    },
    [play],
  );

  const seek = useCallback((s: number) => {
    const a = el.current;
    if (a && Number.isFinite(s)) {
      a.currentTime = Math.max(0, s);
      setCurrent(a.currentTime);
    }
  }, []);

  // Controles del sistema (pantalla de bloqueo, auriculares) cuando el navegador los ofrece.
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      artwork: track.cover ? [{ src: track.cover }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => void el.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => el.current?.pause());
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [track]);

  const value = useMemo<AudioState>(
    () => ({ track, playing, loading, error, current, duration, play, pause, toggle, seek, stop }),
    [track, playing, loading, error, current, duration, play, pause, toggle, seek, stop],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio
        ref={el}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlaying={() => setLoading(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
        onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
        onError={(e) => {
          if (e.currentTarget.getAttribute("src")) {
            setError(true);
            setLoading(false);
            setPlaying(false);
          }
        }}
      />
    </Ctx.Provider>
  );
}

export function useAudio(): AudioState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAudio debe usarse dentro de AudioProvider");
  return v;
}

export function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const t = Math.floor(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
