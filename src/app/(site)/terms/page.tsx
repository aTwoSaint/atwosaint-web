import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms of use of the aTwoSaint website." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>By using this website you accept these terms.</p>

      <h2>Content and rights</h2>
      <p>
        All music, artwork, logos, texts and images on this site belong to aTwoSaint or are used with permission, and all
        rights are reserved. The audio on this site is a <strong>preview for listening only</strong>: you may not
        download, record, redistribute, sample or use it in any release without a license.
      </p>

      <h2>Buying and licensing beats</h2>
      <p>
        Beats are sold through Traktrain. The license you choose there (its scope, price and conditions) governs what you
        may do with the beat, and the purchase is a contract between you and the seller on that platform under its terms.
        This site only links to it.
      </p>

      <h2>Archives</h2>
      <p>
        The Archives section collects visual references for inspiration. Images belong to their respective authors. If
        you own an image and want it credited or removed, write to <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Use of the site</h2>
      <p>
        You agree not to attack, overload or probe the site, try to access the administration area, or scrape it in a
        way that harms its operation.
      </p>

      <h2>Liability</h2>
      <p>
        The site is provided “as is”. We do our best to keep it available and accurate but do not guarantee uninterrupted
        service and are not responsible for third-party sites we link to.
      </p>

      <h2>Law</h2>
      <p>These terms are governed by Spanish law. Changes are published on this page with a new date.</p>
    </LegalPage>
  );
}
