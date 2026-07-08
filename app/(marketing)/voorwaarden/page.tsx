import type { Metadata } from "next";

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Algemene voorwaarden", alternates: { canonical: "/voorwaarden" } };

export default function TermsPage() {
  return (
    <LegalShell title="Algemene voorwaarden" updated="5 juli 2026">
      <h2>1. Definities</h2>
      <p>
        “ComplAI” verwijst naar de dienst van AIF OÜ (besloten vennootschap naar
        Ests recht, registratiecode 16654436, btw-nr. EE102744992, gevestigd te
        Tehnika 27-5, 10149 Tallinn, Estland). “Dienst” verwijst naar
        het online platform. “Klant” verwijst naar de organisatie die een account
        aanmaakt of een abonnement afsluit.
      </p>

      <h2>2. Toepasselijkheid</h2>
      <p>
        Deze voorwaarden zijn van toepassing op elk gebruik van de Dienst en op
        alle overeenkomsten tussen ComplAI en de Klant.
      </p>

      <h2>3. De dienst</h2>
      <p>
        ComplAI biedt hulpmiddelen om te werken aan naleving van de EU AI Act,
        waaronder een risicoscan, AI-register, documentgeneratie, e-learning en
        governance-functionaliteit.
      </p>

      <h2>4. Geen juridisch advies</h2>
      <p>
        De Dienst, de gegenereerde documenten en de scanresultaten zijn
        hulpmiddelen en <strong>vormen geen juridisch advies</strong>. De Klant
        blijft zelf verantwoordelijk voor naleving van wet- en regelgeving en
        dient de output te (laten) controleren.
      </p>

      <h2>5. Account en gebruik</h2>
      <p>
        De Klant is verantwoordelijk voor het geheimhouden van inloggegevens en
        voor het gebruik onder zijn account. Misbruik is niet toegestaan.
      </p>

      <h2>6. Abonnement en betaling</h2>
      <p>
        Betaalde abonnementen worden vooraf gefactureerd per maand of per jaar.
        Prijzen zijn exclusief btw. Betaling verloopt via onze betaalprovider.
      </p>

      <h2>7. Looptijd en opzegging</h2>
      <p>
        Abonnementen zijn maandelijks opzegbaar (bij maandbetaling) respectievelijk
        jaarlijks (bij jaarbetaling), tenzij anders overeengekomen.
      </p>

      <h2>8. Beschikbaarheid</h2>
      <p>
        We streven naar een hoge beschikbaarheid, maar garanderen geen
        ononderbroken toegang. Onderhoud kondigen we waar mogelijk aan.
      </p>

      <h2>9. Intellectueel eigendom</h2>
      <p>
        Alle rechten op het platform berusten bij ComplAI. De Klant behoudt de
        rechten op de eigen ingevoerde gegevens en gegenereerde documenten.
      </p>

      <h2>10. Aansprakelijkheid</h2>
      <p>
        Behoudens opzet of grove schuld is de aansprakelijkheid van ComplAI
        beperkt tot het bedrag dat in de betreffende periode is betaald.
        Indirecte schade is uitgesloten.
      </p>

      <h2>11. Toepasselijk recht</h2>
      <p>
        Op deze voorwaarden is Ests recht van toepassing. Geschillen worden
        voorgelegd aan de bevoegde rechter te Tallinn, Estland (Harju Maakohus).
        Dwingendrechtelijke bescherming die de consument geniet op grond van het
        recht van zijn woonland blijft onverlet.
      </p>
    </LegalShell>
  );
}
