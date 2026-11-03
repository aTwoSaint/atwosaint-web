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
    <main className="wii-detail">
      <Link href="/" className="wii-pill">
        <span aria-hidden>←</span> Volver a Music
      </Link>
      <article className="wii-detail__card" style={{ gridTemplateColumns: "1fr", maxWidth: "40rem" }}>
        <div>
          <h1 className="wii-detail__title">{about.title}</h1>
          {about.paragraphs.map((p) => (
            <p key={p} className="wii-detail__text">
              {p}
            </p>
          ))}
          <p className="wii-detail__text">
            <Link href="/referencias" className="wii-link">
              References
            </Link>
          </p>
          {hasContact(contact) ? (
            <section aria-labelledby="about-contact" style={{ marginTop: "1.5rem" }}>
              <h2 id="about-contact" className="wii-detail__meta">
                Contacto
              </h2>
              {contact.email ? (
                <p className="wii-detail__text">
                  <a className="wii-link" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </p>
              ) : null}
              {contact.instagram ? (
                <p className="wii-detail__text">
                  <a className="wii-link" href={contact.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram ↗
                  </a>
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      </article>
    </main>
  );
}
