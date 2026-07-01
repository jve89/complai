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
  | "gpai_docs";

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

// ── Builders ─────────────────────────────────────────────────────────────────

function buildAiPolicy(
  company: Company,
  systems: AiSystem[]
): DocumentContent {
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
            ? "De organisatie houdt een actueel register bij van de ingezette AI-systemen:"
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
  return {
    title: "Risicobeoordeling AI-systemen",
    subtitle: company.name,
    intro: `Deze risicobeoordeling brengt de AI-systemen van ${company.name} in kaart en classificeert ze volgens het risicokader van de EU AI Act.`,
    sections: [
      {
        heading: "1. Samenvatting",
        paragraphs: [
          `Er zijn ${systems.length} AI-systemen beoordeeld, waarvan ${high.length} als hoog of onaanvaardbaar risico zijn geclassificeerd.`,
        ],
      },
      {
        heading: "2. Overzicht van systemen",
        table: systems.length
          ? systemsTable(systems)
          : { headers: ["Systeem"], rows: [["Geen systemen geregistreerd"]] },
      },
      {
        heading: "3. Hoog-risico systemen",
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
        heading: "4. Aanbevolen vervolgstappen",
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
          ? ["De volgende hoog-risico systemen zijn in scope van deze toets:"]
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
  return {
    title: "EU-conformiteitsverklaring",
    subtitle: company.name,
    intro: `Deze verklaring wordt door de aanbieder opgesteld conform Artikel 47 van de EU AI Act. Vul de gegevens aan, controleer de inhoud en stel de verklaring formeel vast.`,
    sections: [
      {
        heading: "1. Aanbieder",
        paragraphs: [
          `${company.name}, [adres], [KvK-nummer], [contactgegevens].`,
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
          `Namens ${company.name}: [naam], [functie], [plaats], [datum], [handtekening].`,
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
};

export function buildDocument(
  type: DocumentType,
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  return BUILDERS[type](company, systems);
}
