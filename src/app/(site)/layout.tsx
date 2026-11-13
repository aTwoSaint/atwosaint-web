import { BottomNav } from "@/components/night/BottomNav";
import { MiniPlayer } from "@/components/night/MiniPlayer";
import { Splash, SplashScript } from "@/components/night/Splash";
import { AudioProvider } from "@/features/audio/AudioProvider";

/**
 * Capa pública: visión nocturna (fondo, viñeteado), splash, navegación inferior y el único reproductor.
 * No toca datos ni administración.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <AudioProvider>
      <SplashScript />
      <noscript>
        <style>{`.nv-splash{display:none!important}`}</style>
      </noscript>
      <div className="nv-root">
        <div className="nv-stage" data-night-content>
          {children}
        </div>
        <MiniPlayer />
        <BottomNav />
        <Splash />
        <div className="nv-lens" aria-hidden />
      </div>
    </AudioProvider>
  );
}
