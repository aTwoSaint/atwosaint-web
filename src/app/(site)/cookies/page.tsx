import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Cookie Policy", description: "Cookies and similar technologies used by aTwoSaint." };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        This site uses <strong>no analytics, advertising or tracking cookies</strong>, and no third-party cookies. That is
        why it shows no consent banner: only strictly necessary technologies are used, which do not require consent.
      </p>

      <h2>What is stored in your browser</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Purpose</th>
            <th scope="col">Who gets it</th>
            <th scope="col">Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>__Host-atw_session</code>
            </td>
            <td>Keeps the administrator signed in (secure, HttpOnly).</td>
            <td>Only the site owner, after signing in</td>
            <td>8 hours</td>
          </tr>
          <tr>
            <td>
              <code>atw_admin</code>
            </td>
            <td>Shows the administrator a shortcut to the admin area. Grants no access.</td>
            <td>Only the site owner, after signing in</td>
            <td>8 hours</td>
          </tr>
          <tr>
            <td>
              <code>atw_intro_seen</code> (sessionStorage)
            </td>
            <td>Remembers that the welcome screen was already shown in this visit.</td>
            <td>Everyone; no personal data</td>
            <td>Until the tab is closed</td>
          </tr>
        </tbody>
      </table>

      <h2>Other sites</h2>
      <p>
        Links to Instagram, YouTube, TikTok, Traktrain or Gmail open those services, which may set their own cookies under
        their own policies. Nothing from them is embedded on this site.
      </p>

      <h2>If this changes</h2>
      <p>
        If analytics or any non-essential technology is ever added, it will stay off until you give consent, and this
        page will be updated first.
      </p>
    </LegalPage>
  );
}
