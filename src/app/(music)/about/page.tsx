import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/content/about";
import { hasContact, parseContact } from "@/features/contact/contact";

export const metadata: Metadata = {
  title: "About",
  description: "Sobre ATWOSAINT.",
};

export default function AboutPage() {
  const contact = parseContact({
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    CONTACT_INSTAGRAM_URL: process.env.CONTACT_INSTAGRAM_URL,
  });

  return (
    <main className="room__main room__main--page">
      <article className="about">
        <h1 className="about__title">{about.title}</h1>
        {about.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="about__links">
          <Link href="/">Music</Link>
          <Link href="/referencias">References</Link>
        </p>
        {hasContact(contact) ? (
          <section aria-labelledby="about-contact" className="about__contact">
            <h2 id="about-contact">Contacto</h2>
            {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null}
            {contact.instagram ? (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
                Instagram ↗
              </a>
            ) : null}
          </section>
        ) : null}
      </article>
    </main>
  );
}
