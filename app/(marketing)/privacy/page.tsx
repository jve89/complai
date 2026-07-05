import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Privacyverklaring" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacyverklaring" updated="5 juli 2026">
      <p>
        ComplAI is een dienst van DARO (eenmanszaak, KvK 77906934, gevestigd te
        It Ankerplak 7, 8802 CS Franeker). We hechten veel waarde aan uw privacy.
        In deze verklaring leggen we uit welke persoonsgegevens we verwerken,
        waarom en hoe we daarmee omgaan, conform de Algemene verordening
        gegevensbescherming (AVG).
      </p>

      <h2>1. Verwerkingsverantwoordelijke</h2>
      <p>
        Voor het gebruik van het ComplAI-platform door uw organisatie is uw
        organisatie verwerkingsverantwoordelijke en treedt ComplAI op als
        verwerker. Voor onze eigen website en marketing zijn wij zelf
        verwerkingsverantwoordelijke.
      </p>

      <h2>2. Welke gegevens we verwerken</h2>
      <ul>
        <li>Account- en contactgegevens (naam, e-mailadres, organisatie, rol);</li>
        <li>Bedrijfsgegevens die u invoert (AI-register, documenten, scans);</li>
        <li>Gebruiksgegevens en logbestanden (IP-adres, browser, handelingen);</li>
        <li>Betaal- en factuurgegevens (verwerkt via onze betaalprovider).</li>
      </ul>

      <h2>3. Doeleinden en rechtsgronden</h2>
      <p>
        We verwerken gegevens om de dienst te leveren (uitvoering van de
        overeenkomst), om u te ondersteunen en te informeren (gerechtvaardigd
        belang), voor facturatie (wettelijke verplichting) en, waar van
        toepassing, op basis van uw toestemming.
      </p>

      <h2>4. Bewaartermijnen</h2>
      <p>
        We bewaren gegevens niet langer dan nodig. Account- en inhoudgegevens
        (waaronder scans, documenten en het AI-register) bewaren we gedurende de
        looptijd van de overeenkomst en verwijderen we daarna binnen 60 dagen,
        tenzij een wettelijke bewaarplicht geldt. Factuur- en administratiegegevens
        bewaren we conform de fiscale bewaarplicht van 7 jaar. Contactberichten
        bewaren we maximaal 24 maanden. Back-ups roteren binnen 35 dagen.
      </p>

      <h2>5. Subverwerkers en gegevenslocatie</h2>
      <p>
        Voor het leveren van de dienst schakelen we zorgvuldig geselecteerde
        subverwerkers in:
      </p>
      <ul>
        <li><strong>Supabase</strong> — database en authenticatie (opslag binnen de EU, regio eu-west-1);</li>
        <li><strong>Vercel</strong> — hosting en levering van de applicatie;</li>
        <li><strong>Stripe</strong> — betalingsverwerking;</li>
        <li><strong>Resend</strong> — verzending van transactionele e-mail.</li>
      </ul>
      <p>
        Met elke subverwerker sluiten we een verwerkersovereenkomst. Uw scans,
        documenten en accountgegevens worden opgeslagen binnen de EU. Voor zover
        een subverwerker persoonsgegevens buiten de EER verwerkt, gebeurt dit
        onder passende waarborgen, zoals de EU-modelcontractbepalingen (SCC's).
      </p>

      <h2>6. Beveiliging</h2>
      <p>
        We nemen passende technische en organisatorische maatregelen, waaronder
        versleuteling van gegevens in transit en in rust, toegangsbeperking en
        logging.
      </p>

      <h2>7. Uw rechten</h2>
      <p>
        U heeft recht op inzage, correctie, verwijdering, beperking, overdracht
        en bezwaar. Neem hiervoor contact op via info@complai-eu.nl. U kunt ook een
        klacht indienen bij de Autoriteit Persoonsgegevens.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We gebruiken functionele en (geanonimiseerde) analytische cookies. Zie
        ons <a href="/cookies">cookiebeleid</a> voor meer informatie.
      </p>

      <h2>9. Wijzigingen en contact</h2>
      <p>
        We kunnen deze verklaring aanpassen. Vragen? Mail naar info@complai-eu.nl.
      </p>
    </LegalShell>
  );
}
