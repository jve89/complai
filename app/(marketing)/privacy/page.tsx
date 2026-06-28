import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Privacyverklaring" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacyverklaring" updated="28 juni 2026">
      <p>
        ComplAI ([bedrijfsnaam], KvK [nummer], gevestigd te [adres]) hecht veel
        waarde aan uw privacy. In deze verklaring leggen we uit welke
        persoonsgegevens we verwerken, waarom en hoe we daarmee omgaan, conform
        de Algemene verordening gegevensbescherming (AVG).
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
        bewaren we gedurende de looptijd van de overeenkomst en verwijderen we
        daarna binnen [termijn]. Factuurgegevens bewaren we conform de wettelijke
        bewaarplicht (7 jaar).
      </p>

      <h2>5. Subverwerkers</h2>
      <p>
        Voor het leveren van de dienst schakelen we zorgvuldig geselecteerde
        partijen in, waaronder onze hostingprovider, database/auth-leverancier,
        betaalprovider en e-mailprovider. Met elke subverwerker sluiten we een
        verwerkersovereenkomst. Verwerking vindt binnen de EER plaats.
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
        en bezwaar. Neem hiervoor contact op via [e-mailadres]. U kunt ook een
        klacht indienen bij de Autoriteit Persoonsgegevens.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We gebruiken functionele en (geanonimiseerde) analytische cookies. Zie
        ons <a href="/cookies">cookiebeleid</a> voor meer informatie.
      </p>

      <h2>9. Wijzigingen en contact</h2>
      <p>
        We kunnen deze verklaring aanpassen. Vragen? Mail naar [e-mailadres].
      </p>
    </LegalShell>
  );
}
