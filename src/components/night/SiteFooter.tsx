import Image from "next/image";
import Link from "next/link";
import { legalHolder, site } from "@/content/site";
import { InstagramIcon, MailIcon, TikTokIcon, TraktrainIcon, YouTubeIcon } from "./icons";

const socials = [
  { label: "Instagram", href: site.socials.instagram, Icon: InstagramIcon },
  { label: "YouTube", href: site.socials.youtube, Icon: YouTubeIcon },
  { label: "TikTok", href: site.socials.tiktok, Icon: TikTokIcon },
  { label: "Traktrain", href: site.traktrain, Icon: TraktrainIcon },
] as const;

/** Pie de página: marca, redes con un clic, contacto, copyright y documentos legales. */
export function SiteFooter() {
  return (
    <footer className="nv-footer">
      <div className="nv-footer__top">
        <Image src="/logo-night.png" alt="aTwoSaint" width={667} height={327} className="nv-footer__logo" />
        <ul className="nv-footer__social" aria-label="aTwoSaint on the web">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} title={label}>
                <Icon width={22} height={22} />
              </a>
            </li>
          ))}
          <li>
            <a href={site.emailCompose} target="_blank" rel="noopener noreferrer" aria-label="Email aTwoSaint (opens in a new tab)" title="Email">
              <MailIcon width={22} height={22} />
            </a>
          </li>
        </ul>
        <Link href="/contact" className="nv-footer__contact">
          Contact
        </Link>
      </div>
      <div className="nv-footer__legal">
        <p>
          © {new Date().getFullYear()} {legalHolder.name ?? site.name}. All rights reserved.
        </p>
        <ul>
          <li>
            <Link href="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms">Terms of Use</Link>
          </li>
          <li>
            <Link href="/cookies">Cookie Policy</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
