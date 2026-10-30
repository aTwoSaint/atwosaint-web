import { BottomBar } from "@/components/wii/BottomBar";
import { IntroScreen } from "@/components/wii/IntroScreen";
import { IntroScript } from "@/components/wii/IntroScript";
import { WiiCursor } from "@/components/wii/WiiCursor";
import { parseContact } from "@/features/contact/contact";

/** Capa de presentación pública: intro, barra inferior y cursor. No toca datos ni administración. */
export default function WiiLayout({ children }: LayoutProps<"/">) {
  const contact = parseContact({
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    CONTACT_INSTAGRAM_URL: process.env.CONTACT_INSTAGRAM_URL,
  });

  return (
    <>
      <IntroScript />
      <noscript>
        <style>{`.wii-intro{display:none!important}`}</style>
      </noscript>
      <div className="wii-stage" data-wii-content>
        {children}
      </div>
      <BottomBar contact={contact} />
      <IntroScreen />
      <WiiCursor />
    </>
  );
}
