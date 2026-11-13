import type { Metadata } from "next";
import { InstagramIcon, MailIcon, TikTokIcon, TraktrainIcon, YouTubeIcon } from "@/components/night/icons";
import { SiteFooter } from "@/components/night/SiteFooter";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with aTwoSaint: collaborations, custom beats and licensing questions.",
};

const links = [
  { label: "Email", detail: site.email, href: site.emailCompose, Icon: MailIcon },
  { label: "Instagram", detail: "@atwosaint_", href: site.socials.instagram, Icon: InstagramIcon },
  { label: "YouTube", detail: "@atwosaint2", href: site.socials.youtube, Icon: YouTubeIcon },
  { label: "TikTok", detail: "@atwosaint", href: site.socials.tiktok, Icon: TikTokIcon },
  { label: "Traktrain", detail: "traktrain.com/atwosaint", href: site.traktrain, Icon: TraktrainIcon },
] as const;

/**
 * Contacto sin formulario: cada enlace abre la app o la web correspondiente. Así la web no recoge ni
 * almacena mensajes (no hay datos personales que proteger ni spam que filtrar en el servidor).
 */
export default function ContactPage() {
  return (
    <main className="nv-page nv-prose">
      <header className="nv-pagehead">
        <h1 className="nv-pagehead__title">Contact</h1>
        <p className="nv-pagehead__sub">Collaborations, custom beats and licensing questions — write or message on any channel.</p>
      </header>
      <ul className="nv-contact">
        {links.map(({ label, detail, href, Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="nv-contact__row">
              <Icon width={26} height={26} />
              <span className="nv-contact__label">{label}</span>
              <span className="nv-contact__detail">{detail}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
      <SiteFooter />
    </main>
  );
}
