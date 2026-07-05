import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Cookiebeleid" };

export default function CookiePage() {
  return (
    <LegalShell title="Cookiebeleid" updated="5 juli 2026">
      <h2>1. Wat zijn cookies?</h2>
      <p>
        Cookies zijn kleine tekstbestanden die bij een bezoek aan onze website op
        uw apparaat worden geplaatst. We gebruiken ze om de website te laten
        werken en te verbeteren.
      </p>

      <h2>2. Welke cookies gebruiken we?</h2>
      <ul>
        <li>
          <strong>Functionele cookies</strong> — noodzakelijk voor het
          functioneren van de website en het inloggen. Hiervoor is geen
          toestemming vereist.
        </li>
        <li>
          <strong>Analytische cookies</strong> — om geanonimiseerd te begrijpen
          hoe de website wordt gebruikt, zodat we deze kunnen verbeteren.
        </li>
      </ul>

      <h2>3. Toestemming</h2>
      <p>
        Voor niet-noodzakelijke cookies vragen we uw toestemming. U kunt deze op
        elk moment intrekken via uw browserinstellingen.
      </p>

      <h2>4. Cookies beheren</h2>
      <p>
        U kunt cookies verwijderen of blokkeren via de instellingen van uw
        browser. Houd er rekening mee dat de website dan mogelijk niet volledig
        werkt.
      </p>

      <h2>5. Contact</h2>
      <p>Vragen over cookies? Mail naar info@complai-eu.nl.</p>
    </LegalShell>
  );
}
