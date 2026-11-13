import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalHolder, site } from "@/content/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How aTwoSaint handles personal data." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy describes the data this website actually handles. aTwoSaint does not use advertising, analytics or
        tracking tools, has no user accounts and no forms for visitors.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {legalHolder.name ?? "aTwoSaint"}, an independent creative project based in Spain.
        {legalHolder.taxId ? ` Tax ID: ${legalHolder.taxId}.` : ""}
        {legalHolder.address ? ` Address: ${legalHolder.address}.` : ""} Contact:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>What data is handled</h2>
      <ul>
        <li>
          <strong>Hosting and delivery.</strong> The site, images and audio previews are served by Vercel Inc. Like any
          web host, Vercel processes technical data of each request (IP address, browser, requested page, date and time)
          to deliver the site and keep it secure. We do not use this data to identify visitors.
        </li>
        <li>
          <strong>Messages you send us.</strong> If you email us or message us on a social network, we receive what you
          choose to send and use it only to reply. Those messages are handled by your email or social network provider
          as well.
        </li>
        <li>
          <strong>Administrator area.</strong> Only the site owner signs in. To block repeated password guesses, failed
          sign-in attempts are recorded as an anonymous code derived from the connection (never the IP address or the
          password) and deleted within 24 hours.
        </li>
        <li>
          <strong>On your device.</strong> A temporary marker in the browser (<code>sessionStorage</code>) remembers that
          the welcome screen has already been shown during the visit. It holds no personal data and disappears when you
          close the tab. See the <a href="/cookies">Cookie Policy</a>.
        </li>
      </ul>

      <h2>Purchases</h2>
      <p>
        Beats are bought on Traktrain, a third-party service. Payment and licensing data are collected and handled by
        Traktrain under its own terms and privacy policy; aTwoSaint does not see or store payment details.
      </p>

      <h2>Links to other sites</h2>
      <p>
        The site links to Instagram, YouTube, TikTok, Traktrain and Gmail. Once you follow a link, the privacy policy of
        that service applies.
      </p>

      <h2>Why and how long</h2>
      <p>
        Technical data is processed on the basis of our legitimate interest in running and securing the site; messages
        on the basis of your request. Messages are kept only as long as needed to answer you and for any later
        collaboration. Hosting logs are kept by Vercel under its own retention rules.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you can ask to access, correct, delete, restrict or object to the processing of your data, and
        request portability, by writing to <a href={`mailto:${site.email}`}>{site.email}</a>. You can also complain to
        the Spanish data protection authority (AEPD, <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>Changes</h2>
      <p>If the site starts handling new data (for example analytics or a contact form), this policy will be updated first.</p>
    </LegalPage>
  );
}
