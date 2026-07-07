import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Verwerkersovereenkomst" };

export default function DpaPage() {
  return (
    <LegalShell title="Verwerkersovereenkomst (DPA)" updated="5 juli 2026">
      <p>
        Deze verwerkersovereenkomst is van toepassing wanneer ComplAI — een dienst
        van AIF OÜ (besloten vennootschap naar Ests recht, registratiecode
        16654436, btw-nr. EE102744992, gevestigd te Tehnika 27-5, 10149 Tallinn,
        Estland) — namens uw organisatie persoonsgegevens verwerkt bij het leveren
        van de Dienst. Uw organisatie is verwerkingsverantwoordelijke; ComplAI is
        verwerker.
      </p>

      <h2>1. Onderwerp en instructies</h2>
      <p>
        ComplAI verwerkt persoonsgegevens uitsluitend op basis van schriftelijke
        instructies van de verwerkingsverantwoordelijke en voor zover nodig om de
        Dienst te leveren.
      </p>

      <h2>2. Geheimhouding</h2>
      <p>
        Personen die toegang hebben tot de gegevens zijn tot geheimhouding
        verplicht.
      </p>

      <h2>3. Beveiliging</h2>
      <p>
        ComplAI treft passende technische en organisatorische maatregelen
        (waaronder versleuteling, toegangsbeheer en logging) ter beveiliging van
        de gegevens.
      </p>

      <h2>4. Subverwerkers</h2>
      <p>
        ComplAI schakelt de volgende subverwerkers in en legt hen gelijkwaardige
        verplichtingen op:
      </p>
      <ul>
        <li><strong>Supabase</strong> — database en authenticatie (opslag binnen de EU, regio eu-west-1);</li>
        <li><strong>Vercel</strong> — hosting en levering van de applicatie;</li>
        <li><strong>Stripe</strong> — betalingsverwerking;</li>
        <li><strong>Resend</strong> — verzending van transactionele e-mail.</li>
      </ul>
      <p>
        Uw gegevens worden opgeslagen binnen de EU. Voor zover een subverwerker
        persoonsgegevens buiten de EER verwerkt, gebeurt dit onder passende
        waarborgen (EU-modelcontractbepalingen). ComplAI informeert de
        verwerkingsverantwoordelijke bij voorgenomen wijzigingen in de
        subverwerkers.
      </p>

      <h2>5. Rechten van betrokkenen</h2>
      <p>
        ComplAI ondersteunt de verwerkingsverantwoordelijke redelijkerwijs bij
        verzoeken van betrokkenen (inzage, correctie, verwijdering, etc.).
      </p>

      <h2>6. Datalekken</h2>
      <p>
        ComplAI informeert de verwerkingsverantwoordelijke zonder onredelijke
        vertraging na het ontdekken van een inbreuk in verband met
        persoonsgegevens.
      </p>

      <h2>7. Audit</h2>
      <p>
        De verwerkingsverantwoordelijke kan, met redelijke aankondiging, de
        naleving van deze overeenkomst (laten) controleren.
      </p>

      <h2>8. Teruggave en verwijdering</h2>
      <p>
        Na beëindiging van de overeenkomst verwijdert of retourneert ComplAI de
        persoonsgegevens, naar keuze van de verwerkingsverantwoordelijke, behoudens
        wettelijke bewaarplichten.
      </p>

      <h2>9. Duur</h2>
      <p>
        Deze verwerkersovereenkomst geldt zolang ComplAI persoonsgegevens verwerkt
        in het kader van de Dienst.
      </p>
    </LegalShell>
  );
}
