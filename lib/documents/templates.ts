import type { Company, AiSystem } from "@prisma/client";

import { RISK_LABEL, ROLE_LABEL } from "@/lib/register/labels";

export type DocumentType =
  | "ai_policy"
  | "risk_assessment"
  | "fria"
  | "transparency"
  | "tech_doc"
  | "doc_conformity"
  | "assessment_record"
  | "gpai_docs"
  | "audit_report"
  | "compliance_manual";

export interface DocSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface DocumentContent {
  title: string;
  subtitle?: string;
  intro?: string;
  sections: DocSection[];
}

export interface DocumentMeta {
  type: DocumentType;
  name: string;
  description: string;
  /** When true, the document is built around the high-risk systems. */
  highRiskFocused?: boolean;
}

export const DOCUMENT_META: DocumentMeta[] = [
  {
    type: "ai_policy",
    name: "AI-beleid",
    description:
      "Vastgelegd beleid voor verantwoord gebruik van AI binnen uw organisatie.",
  },
  {
    type: "risk_assessment",
    name: "Risicobeoordeling",
    description:
      "Beoordeling van alle geregistreerde AI-systemen en hun risiconiveau.",
  },
  {
    type: "fria",
    name: "FRIA (grondrechtentoets)",
    description:
      "Fundamental Rights Impact Assessment voor uw hoog-risico AI-systemen.",
    highRiskFocused: true,
  },
  {
    type: "transparency",
    name: "Transparantieverklaring",
    description:
      "Verklaring over transparantie richting gebruikers (Artikel 50).",
  },
  {
    type: "tech_doc",
    name: "Technische documentatie (Annex IV)",
    description:
      "Technisch dossier voor hoog-risico AI-systemen conform Artikel 11 en Annex IV.",
    highRiskFocused: true,
  },
  {
    type: "doc_conformity",
    name: "EU-conformiteitsverklaring",
    description:
      "Verklaring van de aanbieder dat het systeem voldoet aan de AI Act (Artikel 47).",
    highRiskFocused: true,
  },
  {
    type: "assessment_record",
    name: "Beoordelingsdossier (Art. 6(4))",
    description:
      "Vastlegging van uw Art. 6(3)-beoordeling dat een systeem niet hoog-risico is.",
  },
  {
    type: "gpai_docs",
    name: "GPAI-documentatie",
    description:
      "Modeldocumentatie voor AI-modellen voor algemene doeleinden (Artikel 53).",
  },
  {
    type: "audit_report",
    name: "AI Act Readiness Audit",
    description:
      "Consolidatierapport: inventarisatie, risicoclassificatie (verkeerslicht) en een verbeterplan per systeem.",
  },
  {
    type: "compliance_manual",
    name: "AI Act Compliancehandboek",
    description:
      "Eén compleet dossier: alle voor u geldende documenten samengebracht met voorblad, inhoudsopgave en samenvatting.",
  },
];

export function getDocumentMeta(type: DocumentType): DocumentMeta {
  const meta = DOCUMENT_META.find((d) => d.type === type);
  if (!meta) throw new Error(`Onbekend documenttype: ${type}`);
  return meta;
}

function systemsTable(systems: AiSystem[]): DocSection["table"] {
  return {
    headers: ["Systeem", "Leverancier", "Rol", "Risiconiveau"],
    rows: systems.map((s) => [
      s.name,
      s.vendor || "—",
      ROLE_LABEL[s.role],
      RISK_LABEL[s.riskLevel],
    ]),
  };
}

/** Per-system, plain-language obligation summary derived from role + risk level —
 * so the document speaks to the client's actual systems, not generic AI. */
function systemObligationNote(s: AiSystem): string {
  switch (s.riskLevel) {
    case "unacceptable":
      return "Onaanvaardbaar risico (Art. 5): deze toepassing kan onder de verboden praktijken vallen en mag dan niet worden ingezet. Toets dit met voorrang.";
    case "high":
      return (
        "Hoog risico: FRIA (Art. 27), technische documentatie (Annex IV), menselijk toezicht (Art. 14) en logging (Art. 12) zijn van toepassing" +
        (s.role === "provider"
          ? " — als aanbieder draagt u bovendien de conformiteitsbeoordeling (Art. 43) en registratie."
          : " — als gebruiksverantwoordelijke zorgt u voor correcte inzet, toezicht en het bewaren van logs (Art. 26).")
      );
    case "limited":
      return "Beperkt risico: transparantieplicht (Art. 50) — informeer gebruikers dat zij met AI te maken hebben of dat content door AI is gemaakt.";
    default:
      return "Minimaal risico: geen specifieke verplichtingen. AI-geletterdheid (Art. 4) geldt wel voor iedereen die met het systeem werkt.";
  }
}

/** Bullet describing a single system: name (vendor) — obligation note. */
function systemBullets(systems: AiSystem[]): string[] {
  return systems.map(
    (s) => `${s.name}${s.vendor ? ` (${s.vendor})` : ""} — ${systemObligationNote(s)}`
  );
}

// ── Builders ─────────────────────────────────────────────────────────────────

function buildAiPolicy(
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  const highCount = highRiskSystems(systems).length;
  return {
    title: "AI-gebruiksbeleid",
    subtitle: company.name,
    intro: `Dit beleid beschrijft hoe ${company.name} omgaat met de ontwikkeling, inkoop en inzet van kunstmatige intelligentie (AI), in lijn met de EU AI Act.`,
    sections: [
      {
        heading: "1. Doel en reikwijdte",
        paragraphs: [
          `Dit beleid geldt voor alle medewerkers, inhuurkrachten en systemen binnen ${company.name} (sector: ${company.sector ?? "n.v.t."}). Het doel is om AI op een veilige, transparante en verantwoorde manier in te zetten en te voldoen aan de verplichtingen uit de EU AI Act.`,
        ],
      },
      {
        heading: "2. Uitgangspunten",
        bullets: [
          "AI wordt alleen ingezet voor legitieme, vooraf bepaalde doeleinden.",
          "Er is altijd betekenisvol menselijk toezicht op AI-beslissingen met impact op personen.",
          "We zijn transparant richting gebruikers en betrokkenen over de inzet van AI.",
          "We respecteren privacy en grondrechten en voorkomen ongerechtvaardigde discriminatie.",
        ],
      },
      {
        heading: "3. Rollen en verantwoordelijkheden",
        paragraphs: [
          "De directie is eindverantwoordelijk voor AI-compliance. Een aangewezen verantwoordelijke beheert het AI-register, coördineert risicobeoordelingen en bewaakt de naleving van dit beleid.",
        ],
      },
      {
        heading: "4. Verboden toepassingen (Artikel 5)",
        paragraphs: [
          "Toepassingen die onder de verboden praktijken van Artikel 5 vallen — zoals social scoring, manipulatieve technieken of niet-toegestane biometrische identificatie — zijn binnen de organisatie niet toegestaan.",
        ],
      },
      {
        heading: "5. AI-geletterdheid (Artikel 4)",
        paragraphs: [
          "Medewerkers die met AI werken volgen passende training, zodat zij de mogelijkheden, beperkingen en risico's van AI begrijpen. Deelname wordt aantoonbaar vastgelegd.",
        ],
      },
      {
        heading: "6. Transparantie (Artikel 50)",
        paragraphs: [
          "Wanneer personen communiceren met een AI-systeem of AI-gegenereerde content ontvangen, worden zij hierover geïnformeerd.",
        ],
      },
      {
        heading: "7. Register van AI-systemen",
        paragraphs: [
          systems.length
            ? `De organisatie houdt een actueel register bij van ${systems.length} ingezette AI-systemen${
                highCount ? `, waarvan ${highCount} met een hoog risico` : ""
              }:`
            : "Er zijn op dit moment geen AI-systemen geregistreerd. Registreer uw systemen in het AI-register.",
        ],
        table: systems.length ? systemsTable(systems) : undefined,
      },
      {
        heading: "8. Toezicht en evaluatie",
        paragraphs: [
          "Dit beleid wordt minimaal jaarlijks geëvalueerd en bijgewerkt naar aanleiding van wijzigingen in wetgeving, technologie of bedrijfsvoering.",
        ],
      },
    ],
  };
}

function buildRiskAssessment(
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  const high = systems.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "unacceptable"
  );
  const providers = systems.filter((s) => s.role === "provider").length;
  const deployers = systems.length - providers;
  return {
    title: "Risicobeoordeling AI-systemen",
    subtitle: company.name,
    intro: `Deze risicobeoordeling brengt de AI-systemen van ${company.name} in kaart en classificeert ze volgens het risicokader van de EU AI Act.`,
    sections: [
      {
        heading: "1. Samenvatting",
        paragraphs: [
          systems.length
            ? `Er zijn ${systems.length} AI-systemen beoordeeld, waarvan ${high.length} als hoog of onaanvaardbaar risico ${high.length === 1 ? "is" : "zijn"} geclassificeerd. ${providers} hiervan zet ${company.name} in als aanbieder en ${deployers} als gebruiksverantwoordelijke — de rol bepaalt mede welke verplichtingen gelden.`
            : "Er zijn nog geen AI-systemen geregistreerd. Registreer uw systemen in het AI-register; daarna vult deze beoordeling zich automatisch.",
        ],
      },
      {
        heading: "2. Overzicht van systemen",
        table: systems.length
          ? systemsTable(systems)
          : { headers: ["Systeem"], rows: [["Geen systemen geregistreerd"]] },
      },
      {
        heading: "3. Beoordeling per systeem",
        paragraphs: systems.length
          ? ["Per geregistreerd systeem gelden op basis van rol en risiconiveau de volgende verplichtingen:"]
          : ["Zodra u systemen registreert, verschijnt hier per systeem een beoordeling."],
        bullets: systems.length ? systemBullets(systems) : undefined,
      },
      {
        heading: "4. Hoog-risico systemen",
        paragraphs: high.length
          ? [
              "De volgende systemen vereisen aanvullende maatregelen (zoals een FRIA, technische documentatie en menselijk toezicht):",
            ]
          : ["Er zijn geen hoog-risico systemen geïdentificeerd."],
        bullets: high.map(
          (s) => `${s.name} (${s.vendor || "onbekende leverancier"}) — ${RISK_LABEL[s.riskLevel]}`
        ),
      },
      {
        heading: "5. Aanbevolen vervolgstappen",
        bullets: [
          "Bepaal per hoog-risico systeem de benodigde technische en organisatorische maatregelen.",
          "Voer voor hoog-risico systemen een FRIA uit.",
          "Borg menselijk toezicht en logging.",
          "Herhaal deze beoordeling bij wijzigingen en minimaal jaarlijks.",
        ],
      },
    ],
  };
}

function buildFria(company: Company, systems: AiSystem[]): DocumentContent {
  const high = systems.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "unacceptable"
  );
  return {
    title: "Fundamental Rights Impact Assessment (FRIA)",
    subtitle: company.name,
    intro: `Deze grondrechtentoets beoordeelt de impact van de hoog-risico AI-systemen van ${company.name} op de grondrechten van betrokkenen, conform de EU AI Act.`,
    sections: [
      {
        heading: "1. Betrokken systemen",
        paragraphs: high.length
          ? [
              `De volgende ${high.length === 1 ? "hoog-risico systeem is" : `${high.length} hoog-risico systemen zijn`} in scope van deze toets. Beoordeel per systeem de impact op de betrokkenen (bijvoorbeeld sollicitanten, klanten, medewerkers of burgers) en leg de mitigerende maatregelen vast:`,
            ]
          : [
              "Er zijn geen hoog-risico systemen geregistreerd. Registreer en classificeer eerst uw systemen; een FRIA is met name vereist voor hoog-risico AI.",
            ],
        table: high.length ? systemsTable(high) : undefined,
      },
      {
        heading: "2. Mogelijk geraakte grondrechten",
        bullets: [
          "Recht op gelijke behandeling en non-discriminatie",
          "Recht op bescherming van persoonsgegevens (privacy)",
          "Recht op menselijke waardigheid en autonomie",
          "Recht op een eerlijk proces en effectieve rechtsbescherming",
        ],
      },
      {
        heading: "3. Risico's en mitigerende maatregelen",
        bullets: [
          "Bias en discriminatie → periodieke toetsing op vertekening en representatieve data.",
          "Onterechte besluiten → betekenisvol menselijk toezicht en mogelijkheid tot bezwaar.",
          "Privacy-inbreuk → dataminimalisatie en een verwerkersovereenkomst met de leverancier.",
          "Gebrek aan transparantie → uitlegbaarheid en informatie richting betrokkenen.",
        ],
      },
      {
        heading: "4. Menselijk toezicht",
        paragraphs: [
          "Voor elk hoog-risico systeem is vastgelegd wie toezicht houdt, hoe besluiten worden gecontroleerd en hoe betrokkenen bezwaar kunnen maken.",
        ],
      },
      {
        heading: "5. Conclusie",
        paragraphs: [
          high.length
            ? "Met de genoemde maatregelen worden de risico's voor grondrechten tot een aanvaardbaar niveau teruggebracht. Deze toets wordt herzien bij wijzigingen aan de systemen."
            : "Op dit moment is geen FRIA noodzakelijk omdat er geen hoog-risico systemen zijn. Herhaal deze toets zodra dat verandert.",
        ],
      },
    ],
  };
}

function buildTransparency(
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  const userFacing = systems.filter(
    (s) => s.riskLevel === "limited" || s.riskLevel === "high"
  );
  return {
    title: "Transparantieverklaring AI (Artikel 50)",
    subtitle: company.name,
    intro: `${company.name} hecht waarde aan transparantie over de inzet van AI. Deze verklaring beschrijft wanneer en hoe wij u informeren over het gebruik van AI-systemen.`,
    sections: [
      {
        heading: "1. Wanneer u met AI te maken heeft",
        paragraphs: [
          "Wanneer u communiceert met een AI-systeem (zoals een chatbot) of content ontvangt die geheel of gedeeltelijk door AI is gegenereerd, maken wij dit kenbaar.",
        ],
      },
      {
        heading: "2. Systemen met een transparantieverplichting",
        paragraphs: userFacing.length
          ? ["De volgende systemen kunnen direct contact hebben met gebruikers:"]
          : [
              "Op dit moment zijn er geen geregistreerde systemen met directe gebruikersinteractie.",
            ],
        table: userFacing.length ? systemsTable(userFacing) : undefined,
      },
      {
        heading: "3. Uw rechten",
        bullets: [
          "U kunt vragen of een interactie of resultaat door AI tot stand is gekomen.",
          "U kunt bezwaar maken tegen besluiten die uitsluitend op AI zijn gebaseerd.",
          "U kunt een menselijke beoordeling vragen waar dat van toepassing is.",
        ],
      },
      {
        heading: "4. Contact",
        paragraphs: [
          `Heeft u vragen over ons gebruik van AI? Neem dan contact op met ${company.name}.`,
        ],
      },
    ],
  };
}

function highRiskSystems(systems: AiSystem[]): AiSystem[] {
  return systems.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "unacceptable"
  );
}

function buildTechDoc(company: Company, systems: AiSystem[]): DocumentContent {
  const high = highRiskSystems(systems);
  return {
    title: "Technische documentatie (Annex IV)",
    subtitle: company.name,
    intro: `Dit technisch dossier beschrijft de hoog-risico AI-systemen van ${company.name} conform Artikel 11 en Annex IV van de EU AI Act. Vul de onderdelen per systeem aan met uw eigen gegevens.`,
    sections: [
      {
        heading: "1. Algemene beschrijving van het systeem",
        paragraphs: high.length
          ? ["De volgende hoog-risico systemen vallen onder dit dossier:"]
          : ["[Beschrijf het systeem, het beoogde doel en de aanbieder. Er zijn nog geen hoog-risico systemen geregistreerd.]"],
        table: high.length ? systemsTable(high) : undefined,
      },
      {
        heading: "2. Ontwerp en ontwikkeling",
        paragraphs: [
          "[Beschrijf de architectuur, de gebruikte modellen/algoritmen, de belangrijkste ontwerpkeuzes en de logica achter het systeem.]",
        ],
      },
      {
        heading: "3. Data en datagovernance",
        paragraphs: [
          "[Beschrijf de trainings-, validatie- en testdata: herkomst, omvang, kwaliteit en de maatregelen tegen vertekening (bias), conform Artikel 10.]",
        ],
      },
      {
        heading: "4. Prestaties, nauwkeurigheid en robuustheid",
        paragraphs: [
          "[Beschrijf de nauwkeurigheidsmaatstaven, testresultaten, foutmarges en de bekende grenzen van het systeem (Artikel 15).]",
        ],
      },
      {
        heading: "5. Risicobeheersysteem",
        paragraphs: [
          "[Verwijs naar uw risicobeoordeling en FRIA en beschrijf de geïdentificeerde risico's en de mitigerende maatregelen (Artikel 9).]",
        ],
      },
      {
        heading: "6. Menselijk toezicht",
        paragraphs: [
          "[Beschrijf hoe menselijk toezicht is ingericht: wie grijpt in, hoe worden besluiten gecontroleerd en herzien (Artikel 14).]",
        ],
      },
      {
        heading: "7. Wijzigingsbeheer en toegepaste normen",
        bullets: [
          "Dit dossier wordt bijgewerkt bij elke substantiële wijziging aan het systeem.",
          "[Noem de toegepaste geharmoniseerde normen of gemeenschappelijke specificaties.]",
        ],
      },
    ],
  };
}

function buildDocConformity(company: Company, systems: AiSystem[]): DocumentContent {
  const high = highRiskSystems(systems);
  // Filled identity fields render; blanks keep a [marker] to complete before use.
  const addr = company.address?.trim() || "[adres]";
  const kvk = company.kvk?.trim() ? `KvK ${company.kvk.trim()}` : "[KvK-nummer]";
  const repName = company.legalRepName?.trim() || "[naam]";
  const repRole = company.legalRepRole?.trim() || "[functie]";
  return {
    title: "EU-conformiteitsverklaring",
    subtitle: company.name,
    intro: `Deze verklaring wordt door de aanbieder opgesteld conform Artikel 47 van de EU AI Act. Vul de gegevens aan, controleer de inhoud en stel de verklaring formeel vast.`,
    sections: [
      {
        heading: "1. Aanbieder",
        paragraphs: [
          `${company.name}, ${addr}, ${kvk}, [contactgegevens].`,
        ],
      },
      {
        heading: "2. Betreffend AI-systeem",
        paragraphs: high.length
          ? ["Deze verklaring heeft betrekking op:"]
          : ["[Naam, versie en unieke identificatie van het hoog-risico AI-systeem.]"],
        table: high.length ? systemsTable(high) : undefined,
      },
      {
        heading: "3. Verklaring",
        paragraphs: [
          `${company.name} verklaart onder eigen verantwoordelijkheid dat het bovengenoemde hoog-risico AI-systeem voldoet aan de eisen van Hoofdstuk III, Sectie 2 van Verordening (EU) 2024/1689 (de AI Act).`,
        ],
      },
      {
        heading: "4. Toegepaste normen",
        paragraphs: [
          "[Noem de toegepaste geharmoniseerde normen (Artikel 40) of gemeenschappelijke specificaties (Artikel 41).]",
        ],
      },
      {
        heading: "5. Conformiteitsbeoordeling",
        paragraphs: [
          "[Beschrijf de gevolgde conformiteitsbeoordelingsprocedure (Artikel 43) en, indien van toepassing, de betrokken aangemelde instantie.]",
        ],
      },
      {
        heading: "6. Ondertekening",
        paragraphs: [
          `Namens ${company.name}: ${repName}, ${repRole}, [plaats], [datum], [handtekening].`,
        ],
      },
    ],
  };
}

function buildAssessmentRecord(company: Company, systems: AiSystem[]): DocumentContent {
  return {
    title: "Beoordelingsdossier — niet-hoog-risico (Art. 6(3))",
    subtitle: company.name,
    intro: `Dit dossier legt vast waarom een AI-systeem dat onder een Annex III-gebied valt, volgens de beoordeling van ${company.name} geen significant risico vormt voor gezondheid, veiligheid of grondrechten (Artikel 6(3)). Leg deze beoordeling vast vóór ingebruikname (Artikel 6(4)).`,
    sections: [
      {
        heading: "1. Systeem en toepassingsgebied",
        paragraphs: [
          "[Naam en beschrijving van het systeem en het Annex III-gebied waaronder het in beginsel valt.]",
        ],
      },
      {
        heading: "2. Grondslag voor de uitzondering (Art. 6(3))",
        paragraphs: [
          "Geef aan op welke van de volgende voorwaarden u zich beroept en onderbouw dit:",
        ],
        bullets: [
          "Het systeem voert een beperkte procedurele taak uit.",
          "Het verbetert slechts het resultaat van een eerder afgeronde menselijke activiteit.",
          "Het detecteert besluitvormingspatronen en wijkt niet af zonder menselijke toetsing.",
          "Het voert een voorbereidende taak uit voor een beoordeling.",
          "[Onderbouwing: waarom is dit van toepassing op uw systeem?]",
        ],
      },
      {
        heading: "3. Geen profilering",
        paragraphs: [
          "Het systeem voert geen profilering van natuurlijke personen uit. [Bevestig en onderbouw — profilering maakt het systeem alsnog hoog-risico (Art. 6(3), laatste alinea).]",
        ],
      },
      {
        heading: "4. Conclusie",
        paragraphs: [
          "[Conclusie: het systeem is op basis van bovenstaande niet hoog-risico. Dit is een zelfbeoordeling — laat deze juridisch toetsen.]",
        ],
      },
      {
        heading: "5. Registratie",
        paragraphs: [
          "De aanbieder registreert het systeem in de EU-databank vóór ingebruikname (Artikel 49(2)).",
        ],
      },
    ],
  };
}

function buildGpaiDocs(company: Company): DocumentContent {
  return {
    title: "Documentatie AI-model voor algemene doeleinden (GPAI)",
    subtitle: company.name,
    intro: `Deze documentatie hoort bij een AI-model voor algemene doeleinden (GPAI) dat ${company.name} op de markt brengt, conform Artikel 53 en Annex XI/XII van de EU AI Act.`,
    sections: [
      {
        heading: "1. Modelbeschrijving",
        paragraphs: [
          "[Naam, versie, architectuur, aantal parameters, modaliteiten (tekst/beeld/audio) en het beoogde gebruik van het model.]",
        ],
      },
      {
        heading: "2. Trainingsproces",
        paragraphs: [
          "[Beschrijf het trainingsproces, de gebruikte rekenkracht en de belangrijkste methoden.]",
        ],
      },
      {
        heading: "3. Samenvatting trainingsdata",
        paragraphs: [
          "[Publiek beschikbare samenvatting van de gebruikte trainingsdata (Artikel 53(1)(d)).]",
        ],
      },
      {
        heading: "4. Auteursrechtbeleid",
        paragraphs: [
          "De aanbieder hanteert een beleid om het auteursrecht en de naburige rechten te respecteren, inclusief de opt-out onder Artikel 4(3) van de DSM-richtlijn. [Beschrijf uw beleid.]",
        ],
      },
      {
        heading: "5. Capaciteiten en beperkingen",
        paragraphs: [
          "[Beschrijf de capaciteiten, de bekende beperkingen en de risico's van het model.]",
        ],
      },
      {
        heading: "6. Systeemrisico",
        paragraphs: [
          "[Indien de cumulatieve trainingsrekenkracht meer dan 10^25 FLOP bedraagt, gelden aanvullende verplichtingen onder Artikel 55, inclusief melding aan de Europese Commissie (Artikel 52).]",
        ],
      },
    ],
  };
}

// ── Audit report (readiness audit, traffic-light) ────────────────────────────

type TrafficLight = "rood" | "oranje" | "geel" | "groen";

const LIGHT_META: Record<TrafficLight, { label: string; term: string }> = {
  rood: { label: "ROOD — verboden / kritiek", term: "Per direct" },
  oranje: { label: "ORANJE — hoog-risico / serieus", term: "Vóór 2 augustus 2026" },
  geel: { label: "GEEL — transparantie / gering", term: "Overeengekomen termijn" },
  groen: { label: "GROEN — in orde", term: "N.v.t." },
};

function lightFor(riskLevel: AiSystem["riskLevel"]): TrafficLight {
  return riskLevel === "unacceptable"
    ? "rood"
    : riskLevel === "high"
      ? "oranje"
      : riskLevel === "limited"
        ? "geel"
        : "groen";
}

/** Per-finding diagnosis, legal basis and remediation — derived by rule from a
 * system's risk level and role. Exported for unit testing. */
export function auditFinding(s: AiSystem): {
  light: TrafficLight;
  diagnosis: string;
  legalBasis: string;
  remediation: string[];
} {
  const light = lightFor(s.riskLevel);
  const isProvider = s.role === "provider";
  const name = s.name;

  if (light === "rood") {
    return {
      light,
      diagnosis: `${name} kan onder de verboden praktijken van Artikel 5 vallen (bijvoorbeeld ongeoorloofde biometrische identificatie, manipulatie of social scoring). Dit vraagt directe aandacht vóór verder gebruik.`,
      legalBasis:
        "Wettelijke basis: Art. 5 · van kracht sinds 2 februari 2025 · boeterisico tot € 35 mln of 7% van de wereldwijde jaaromzet.",
      remediation: [
        "Staak of beperk de toepassing tot de toelaatbaarheid is vastgesteld.",
        "Laat juridisch toetsen of het systeem onder een verbod van Art. 5 valt.",
        "Leg de uitkomst en de gemaakte keuze vast in het beoordelingsdossier.",
      ],
    };
  }
  if (light === "oranje") {
    return {
      light,
      diagnosis: `${name} is een hoog-risico AI-systeem${
        isProvider ? " dat u onder eigen naam aanbiedt" : " dat u onder eigen verantwoordelijkheid inzet"
      }. Daarvoor gelden de zwaarste verplichtingen, die nog niet volledig zijn ingevuld.`,
      legalBasis:
        "Wettelijke basis: Art. 6 + Annex III (classificatie), Art. 27 (FRIA), Art. 11/Annex IV (technische documentatie) · handhaafbaar vanaf 2 augustus 2026 · boeterisico tot € 15 mln of 3% omzet.",
      remediation: [
        "Voer een grondrechtentoets (FRIA) uit — ComplAI genereert deze op basis van uw register.",
        "Stel de technische documentatie (Annex IV) op en houd deze actueel.",
        "Borg betekenisvol menselijk toezicht (Art. 14) en logging (Art. 12).",
        isProvider
          ? "Rond de conformiteitsbeoordeling af (Art. 43) en registreer het systeem in de EU-databank (Art. 49)."
          : "Gebruik het systeem volgens de instructies van de aanbieder en bewaar de logs (Art. 26).",
      ],
    };
  }
  if (light === "geel") {
    return {
      light,
      diagnosis: `${name} heeft directe interactie met mensen of genereert content. Gebruikers moeten kunnen weten dat zij met AI te maken hebben of dat content door AI is gemaakt.`,
      legalBasis:
        "Wettelijke basis: Art. 50 · handhaafbaar vanaf 2 augustus 2026 · boeterisico tot € 15 mln of 3% omzet.",
      remediation: [
        "Voeg een zichtbare AI-vermelding toe bij interacties en AI-gegenereerde content.",
        "Markeer synthetische beeld-, audio- of videocontent, waar mogelijk machineleesbaar (bijv. C2PA).",
        "Leg deze werkafspraak vast in het AI-gebruiksbeleid.",
      ],
    };
  }
  return {
    light,
    diagnosis: `${name} is minimaal risico en kent geen specifieke verplichtingen onder de AI Act.`,
    legalBasis: "Geen specifieke verplichtingen · AI-geletterdheid (Art. 4) geldt wel.",
    remediation: ["Neem het systeem op in het AI-register voor de aantoonbaarheid."],
  };
}

function buildAuditReport(company: Company, systems: AiSystem[]): DocumentContent {
  const counts: Record<TrafficLight, number> = { rood: 0, oranje: 0, geel: 0, groen: 0 };
  systems.forEach((s) => (counts[lightFor(s.riskLevel)] += 1));
  const flagged = systems.filter((s) => lightFor(s.riskLevel) !== "groen");
  const green = systems.filter((s) => lightFor(s.riskLevel) === "groen");
  const anyProvider = systems.some((s) => s.role === "provider");

  const highlights: string[] = [];
  if (counts.rood) highlights.push("Er zijn mogelijk verboden praktijken (Art. 5) — behandel deze met voorrang.");
  if (counts.oranje) highlights.push("Het zwaartepunt ligt bij de hoog-risico systemen: regel met voorrang de FRIA en technische documentatie.");
  if (counts.geel) highlights.push("De transparantieplicht (Art. 50) is structureel relevant: maak AI-interacties en AI-content herkenbaar.");
  if (anyProvider) highlights.push("Doordat u AI onder eigen naam aanbiedt of wijzigt, kunnen de zwaardere aanbiedersverplichtingen gelden (let op de rolverschuiving, Art. 25).");
  if (!highlights.length) highlights.push("Er zijn geen openstaande aandachtspunten aangetroffen. Houd het register actueel en herhaal de audit jaarlijks.");

  const sections: DocSection[] = [
    {
      heading: "1. Managementsamenvatting",
      paragraphs: [
        systems.length
          ? `${company.name} heeft ${systems.length} AI-syste${systems.length === 1 ? "em" : "men"} laten inventariseren: ${counts.rood} kritiek, ${counts.oranje} hoog-risico, ${counts.geel} transparantie en ${counts.groen} in orde.`
          : `Er zijn nog geen AI-systemen geregistreerd. Registreer uw systemen in het AI-register; dit rapport vult zich daarna automatisch.`,
      ],
      table: {
        headers: ["Classificatie", "Aantal", "Richttermijn"],
        rows: (Object.keys(LIGHT_META) as TrafficLight[]).map((l) => [
          LIGHT_META[l].label,
          String(counts[l]),
          LIGHT_META[l].term,
        ]),
      },
    },
    {
      heading: "Belangrijkste aandachtspunten",
      bullets: highlights,
    },
    {
      heading: "2. Scope, methode en beperkingen",
      paragraphs: [
        `Deze audit beoordeelt de AI-systemen die ${company.name} inzet, getoetst aan Verordening (EU) 2024/1689 (de EU AI Act). De classificatie is gebaseerd op de door u geregistreerde systemen en opgaven.`,
      ],
      table: {
        headers: ["Niveau", "Betekenis", "Richttermijn"],
        rows: [
          ["ROOD", "Verboden praktijk (Art. 5) of hoog-risico zonder enige naleving", "Per direct"],
          ["ORANJE", "Hoog-risico met nog ontbrekende verplichtingen", "Vóór de wettelijke deadline"],
          ["GEEL", "Transparantieplicht of klein documentatiegebrek", "Overeengekomen termijn"],
          ["GROEN", "Voldoet, buiten scope of vrijgesteld", "N.v.t."],
        ],
      },
    },
    {
      heading: "3. Geïnventariseerde systemen",
      table: systems.length
        ? {
            headers: ["#", "Systeem", "Leverancier", "Rol", "Risicoklasse"],
            rows: systems.map((s, i) => [
              String(i + 1),
              s.name,
              s.vendor || "—",
              ROLE_LABEL[s.role],
              RISK_LABEL[s.riskLevel],
            ]),
          }
        : { headers: ["Systeem"], rows: [["Geen systemen geregistreerd"]] },
    },
    {
      heading: "4. Bevindingen en verbeteracties",
      paragraphs: [
        flagged.length
          ? "Per bevinding: een korte diagnose, de wettelijke basis met deadline en boeterisico, en concrete verbeteracties."
          : "Er zijn geen bevindingen die actie vereisen. Alle geregistreerde systemen zijn in orde.",
      ],
    },
  ];

  // One section per flagged system.
  flagged.forEach((s, i) => {
    const f = auditFinding(s);
    sections.push({
      heading: `Bevinding ${String(i + 1).padStart(2, "0")} — ${s.name} · ${LIGHT_META[f.light].label.split(" — ")[0]}`,
      paragraphs: [f.diagnosis, f.legalBasis],
      bullets: f.remediation,
    });
  });

  sections.push({
    heading: "5. Systemen in orde (GROEN)",
    paragraphs: green.length
      ? ["Deze systemen vragen geen actie onder de AI Act. Neem ze wel op in het register voor de aantoonbaarheid."]
      : ["Er zijn geen systemen als 'in orde' geclassificeerd."],
    table: green.length
      ? {
          headers: ["Systeem", "Leverancier", "Aandachtspunt"],
          rows: green.map((s) => [
            s.name,
            s.vendor || "—",
            "Opnemen in AI-register; geen vertrouwelijke data in prompts.",
          ]),
        }
      : undefined,
  });

  sections.push({
    heading: "6. Status van deze audit en beperkingen",
    paragraphs: [
      "Dit is een readiness-audit op basis van uw eigen opgaven en de geregistreerde systemen — géén wettelijke conformiteitscertificering in de zin van de AI Act. Die laatste is voorbehouden aan aangewezen instanties (notified bodies) en geldt alleen voor bepaalde hoog-risico systemen.",
      "Dit rapport is geen juridisch advies. Voor bindende juridische, auteursrechtelijke of privacyvragen schakelt u een specialist in. Herhaal de audit bij een substantiële wijziging van uw AI-gebruik of minimaal jaarlijks.",
    ],
  });

  return {
    title: "AI Act Readiness Audit",
    subtitle: company.name,
    intro: `Dit rapport inventariseert de AI-systemen van ${company.name}, classificeert ze volgens een verkeerslichtmodel en geeft per systeem een concreet verbeterplan, conform de EU AI Act.`,
    sections,
  };
}

// ── Compliance manual (consolidated dossier) ─────────────────────────────────

/** Ordered chapters of the manual and when each applies. */
const MANUAL_CHAPTERS: {
  type: Exclude<DocumentType, "audit_report" | "compliance_manual">;
  label: string;
  when: "always" | "highRisk" | "gpai";
}[] = [
  { type: "ai_policy", label: "AI-gebruiksbeleid", when: "always" },
  { type: "risk_assessment", label: "Risicobeoordeling", when: "always" },
  { type: "transparency", label: "Transparantieverklaring", when: "always" },
  { type: "assessment_record", label: "Beoordelingsdossier (Art. 6(3))", when: "always" },
  { type: "fria", label: "Grondrechtentoets (FRIA)", when: "highRisk" },
  { type: "tech_doc", label: "Technische documentatie (Annex IV)", when: "highRisk" },
  { type: "doc_conformity", label: "EU-conformiteitsverklaring", when: "highRisk" },
  { type: "gpai_docs", label: "GPAI-documentatie", when: "gpai" },
];

function chapterContent(
  type: MANUAL_CHAPTER_TYPE,
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  switch (type) {
    case "ai_policy":
      return buildAiPolicy(company, systems);
    case "risk_assessment":
      return buildRiskAssessment(company, systems);
    case "transparency":
      return buildTransparency(company, systems);
    case "assessment_record":
      return buildAssessmentRecord(company, systems);
    case "fria":
      return buildFria(company, systems);
    case "tech_doc":
      return buildTechDoc(company, systems);
    case "doc_conformity":
      return buildDocConformity(company, systems);
    case "gpai_docs":
      return buildGpaiDocs(company);
  }
}
type MANUAL_CHAPTER_TYPE = (typeof MANUAL_CHAPTERS)[number]["type"];

function buildComplianceManual(company: Company, systems: AiSystem[]): DocumentContent {
  const hasHighRisk = highRiskSystems(systems).length > 0;
  // Loosely read the scan profile for the GPAI-model-provider flag (optional).
  const profile = company.profileJson as
    | { systemFlags?: { gpaiModelProvider?: boolean } }
    | null;
  const gpaiProvider = Boolean(profile?.systemFlags?.gpaiModelProvider);

  const applicable = MANUAL_CHAPTERS.filter((ch) =>
    ch.when === "always"
      ? true
      : ch.when === "highRisk"
        ? hasHighRisk
        : gpaiProvider
  );

  const counts: Record<TrafficLight, number> = { rood: 0, oranje: 0, geel: 0, groen: 0 };
  systems.forEach((s) => (counts[lightFor(s.riskLevel)] += 1));

  const sections: DocSection[] = [];

  sections.push({
    heading: "Documentbeheer",
    table: {
      headers: ["Onderdeel", "Waarde"],
      rows: [
        ["Organisatie", company.name],
        ["Toetsingskader", "Verordening (EU) 2024/1689 (EU AI Act)"],
        ["Aantal AI-systemen", String(systems.length)],
        ["Status", "Concept — zelfverklaard, ter interne vaststelling"],
      ],
    },
  });

  sections.push({
    heading: "Inhoudsopgave",
    bullets: applicable.map((ch, i) => `Hoofdstuk ${i + 1} — ${ch.label}`),
  });

  sections.push({
    heading: "Managementsamenvatting",
    paragraphs: [
      systems.length
        ? `Dit handboek bundelt de documenten die voor ${company.name} gelden op basis van ${systems.length} geregistreerde AI-syste${systems.length === 1 ? "em" : "men"}: ${counts.oranje} hoog-risico, ${counts.geel} met een transparantieplicht en ${counts.groen} in orde. Zie de AI Act Readiness Audit voor het verbeterplan per systeem.`
        : `Er zijn nog geen AI-systemen geregistreerd. Registreer uw systemen in het AI-register; dit handboek vult zich daarna automatisch.`,
    ],
  });

  applicable.forEach((ch, i) => {
    const sub = chapterContent(ch.type, company, systems);
    sections.push({
      heading: `Hoofdstuk ${i + 1} — ${ch.label}`,
      paragraphs: sub.intro ? [sub.intro] : undefined,
    });
    sub.sections.forEach((s) => sections.push(s));
  });

  sections.push({
    heading: "Slotbepalingen",
    paragraphs: [
      "Dit handboek is een zelfverklaard, samengesteld dossier op basis van uw eigen opgaven en de geregistreerde systemen. Het is geen juridisch advies en geen wettelijke conformiteitscertificering in de zin van de AI Act.",
      "Stel het handboek intern vast, laat het waar nodig juridisch toetsen en actualiseer het bij een substantiële wijziging van uw AI-gebruik of minimaal jaarlijks.",
    ],
  });

  return {
    title: "AI Act Compliancehandboek",
    subtitle: company.name,
    intro: `Dit handboek brengt alle voor ${company.name} geldende AI Act-documenten samen in één dossier — met documentbeheer, inhoudsopgave en een samenvatting — klaar om intern vast te stellen.`,
    sections,
  };
}

const BUILDERS: Record<
  DocumentType,
  (company: Company, systems: AiSystem[]) => DocumentContent
> = {
  ai_policy: buildAiPolicy,
  risk_assessment: buildRiskAssessment,
  fria: buildFria,
  transparency: buildTransparency,
  tech_doc: buildTechDoc,
  doc_conformity: buildDocConformity,
  assessment_record: buildAssessmentRecord,
  gpai_docs: (company) => buildGpaiDocs(company),
  audit_report: buildAuditReport,
  compliance_manual: buildComplianceManual,
};

export function buildDocument(
  type: DocumentType,
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  return BUILDERS[type](company, systems);
}
