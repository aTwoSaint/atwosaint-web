import { BottomBar } from "@/components/wii/BottomBar";
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
      <div className="wii-stage" data-wii-content>
        {children}
      </div>
      <BottomBar contact={contact} />
      <WiiCursor />
    </>
  );
}
