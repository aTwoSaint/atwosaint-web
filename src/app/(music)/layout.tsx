import { IntroScreen } from "@/components/wii/IntroScreen";
import { IntroScript } from "@/components/wii/IntroScript";
import { MusicNav } from "@/components/music/MusicNav";
import { Room } from "@/components/music/Room";

/** La habitación: escena, navegación discreta e intro con el logo. */
export default function MusicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <IntroScript />
      <noscript>
        <style>{`.wii-intro{display:none!important}`}</style>
      </noscript>
      <div className="room" data-wii-content>
        <Room />
        <MusicNav />
        <div className="room__content">{children}</div>
      </div>
      <IntroScreen />
    </>
  );
}
