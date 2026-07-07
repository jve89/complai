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
  /** Blank writing fields the client fills in on the printout — each renders a
   * label (what to write) above a number of ruled lines. */
  fields?: { label: string; lines: number }[];
}

/** Shorthand for a fill-in field. */
function field(label: string, lines = 3): NonNullable<DocSection["fields"]>[number] {
  return { label, lines };
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
        heading: "2. Betrokkenen en gebruikscontext",
        paragraphs: [
          "Beschrijf wie door het systeem worden geraakt en in welke context het wordt ingezet.",
        ],
        fields: [
          field("Betrokken groepen (bijv. sollicitanten, klanten, medewerkers, burgers) en de context van inzet", 3),
        ],
      },
      {
        heading: "3. Mogelijk geraakte grondrechten",
        paragraphs: ["Beoordeel welke van deze grondrechten in het geding kunnen zijn:"],
        bullets: [
          "Recht op gelijke behandeling en non-discriminatie",
          "Recht op bescherming van persoonsgegevens (privacy)",
          "Recht op menselijke waardigheid en autonomie",
          "Recht op een eerlijk proces en effectieve rechtsbescherming",
        ],
        fields: [field("Welke grondrechten zijn voor uw systeem het meest relevant, en waarom?", 3)],
      },
      {
        heading: "4. Risico's en mitigerende maatregelen",
        paragraphs: ["Veelvoorkomende risico's en maatregelen ter inspiratie:"],
        bullets: [
          "Bias en discriminatie → periodieke toetsing op vertekening en representatieve data.",
          "Onterechte besluiten → betekenisvol menselijk toezicht en mogelijkheid tot bezwaar.",
          "Privacy-inbreuk → dataminimalisatie en een verwerkersovereenkomst met de leverancier.",
          "Gebrek aan transparantie → uitlegbaarheid en informatie richting betrokkenen.",
        ],
        fields: [field("Uw geïdentificeerde risico's en de concrete maatregelen die u treft", 5)],
      },
      {
        heading: "5. Menselijk toezicht",
        fields: [
          field("Wie houdt toezicht, hoe worden besluiten gecontroleerd en hoe kunnen betrokkenen bezwaar maken?", 4),
        ],
      },
      {
        heading: "6. Conclusie",
        paragraphs: [
          high.length
            ? "Deze toets wordt herzien bij wijzigingen aan de systemen. Laat de beoordeling juridisch toetsen voordat u erop vertrouwt."
            : "Op dit moment is geen FRIA noodzakelijk omdat er geen hoog-risico systemen zijn. Herhaal deze toets zodra dat verandert.",
        ],
        fields: high.length
          ? [field("Uw conclusie: zijn de restrisico's aanvaardbaar, en onder welke voorwaarden?", 3)]
          : undefined,
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
          ? ["Dit dossier betreft de volgende hoog-risico systemen. Vul de onderdelen hieronder per systeem aan:"]
          : ["Beschrijf hieronder het systeem, het beoogde doel en de aanbieder."],
        table: high.length ? systemsTable(high) : undefined,
        fields: high.length ? undefined : [field("Systeem, beoogd doel en aanbieder", 4)],
      },
      {
        heading: "2. Ontwerp en ontwikkeling",
        fields: [
          field("Architectuur, gebruikte modellen/algoritmen en de belangrijkste ontwerpkeuzes", 5),
        ],
      },
      {
        heading: "3. Data en datagovernance (Artikel 10)",
        fields: [
          field("Trainings-, validatie- en testdata: herkomst, omvang en kwaliteit", 4),
          field("Maatregelen tegen vertekening (bias)", 3),
        ],
      },
      {
        heading: "4. Prestaties, nauwkeurigheid en robuustheid (Artikel 15)",
        fields: [
          field("Nauwkeurigheidsmaatstaven, testresultaten en foutmarges", 4),
          field("Bekende grenzen en beperkingen van het systeem", 3),
        ],
      },
      {
        heading: "5. Risicobeheersysteem (Artikel 9)",
        fields: [
          field("Geïdentificeerde risico's en de mitigerende maatregelen — verwijs naar uw risicobeoordeling en FRIA", 5),
        ],
      },
      {
        heading: "6. Menselijk toezicht (Artikel 14)",
        fields: [
          field("Hoe is het menselijk toezicht ingericht? Wie grijpt in en hoe worden besluiten gecontroleerd en herzien?", 5),
        ],
      },
      {
        heading: "7. Wijzigingsbeheer en toegepaste normen",
        paragraphs: [
          "Dit dossier wordt bijgewerkt bij elke substantiële wijziging aan het systeem.",
        ],
        fields: [
          field("Toegepaste geharmoniseerde normen of gemeenschappelijke specificaties", 2),
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
          : undefined,
        table: high.length ? systemsTable(high) : undefined,
        fields: high.length
          ? [field("Versie en unieke identificatie per systeem", 2)]
          : [field("Naam, versie en unieke identificatie van het hoog-risico AI-systeem", 2)],
      },
      {
        heading: "3. Verklaring",
        paragraphs: [
          `${company.name} verklaart onder eigen verantwoordelijkheid dat het bovengenoemde hoog-risico AI-systeem voldoet aan de eisen van Hoofdstuk III, Sectie 2 van Verordening (EU) 2024/1689 (de AI Act).`,
        ],
      },
      {
        heading: "4. Toegepaste normen (Artikel 40/41)",
        fields: [
          field("Toegepaste geharmoniseerde normen of gemeenschappelijke specificaties", 3),
        ],
      },
      {
        heading: "5. Conformiteitsbeoordeling (Artikel 43)",
        fields: [
          field("Gevolgde conformiteitsbeoordelingsprocedure en, indien van toepassing, de betrokken aangemelde instantie", 3),
        ],
      },
      {
        heading: "6. Ondertekening",
        paragraphs: [`Namens ${company.name}: ${repName}, ${repRole}.`],
        fields: [
          field("Plaats en datum", 1),
          field("Handtekening", 2),
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
        fields: [
          field("Naam en beschrijving van het systeem en het Annex III-gebied waaronder het in beginsel valt", 3),
        ],
      },
      {
        heading: "2. Grondslag voor de uitzondering (Art. 6(3))",
        paragraphs: [
          "Geef aan op welke van de volgende voorwaarden u zich beroept:",
        ],
        bullets: [
          "Het systeem voert een beperkte procedurele taak uit.",
          "Het verbetert slechts het resultaat van een eerder afgeronde menselijke activiteit.",
          "Het detecteert besluitvormingspatronen en wijkt niet af zonder menselijke toetsing.",
          "Het voert een voorbereidende taak uit voor een beoordeling.",
        ],
        fields: [field("Onderbouwing: waarom is dit van toepassing op uw systeem?", 4)],
      },
      {
        heading: "3. Geen profilering",
        paragraphs: [
          "Profilering van natuurlijke personen maakt het systeem alsnog hoog-risico (Art. 6(3), laatste alinea).",
        ],
        fields: [field("Bevestig en onderbouw dat het systeem geen profilering uitvoert", 3)],
      },
      {
        heading: "4. Conclusie",
        paragraphs: [
          "Dit is een zelfbeoordeling — laat deze juridisch toetsen voordat u het systeem in gebruik neemt.",
        ],
        fields: [field("Conclusie: waarom is het systeem op basis van het bovenstaande niet hoog-risico?", 3)],
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
        fields: [
          field("Naam, versie, architectuur, aantal parameters en modaliteiten (tekst/beeld/audio)", 3),
          field("Beoogd gebruik van het model", 2),
        ],
      },
      {
        heading: "2. Trainingsproces",
        fields: [
          field("Trainingsproces, gebruikte rekenkracht en de belangrijkste methoden", 4),
        ],
      },
      {
        heading: "3. Samenvatting trainingsdata (Artikel 53(1)(d))",
        fields: [
          field("Publiek beschikbare samenvatting van de gebruikte trainingsdata", 4),
        ],
      },
      {
        heading: "4. Auteursrechtbeleid",
        paragraphs: [
          "De aanbieder hanteert een beleid om het auteursrecht en de naburige rechten te respecteren, inclusief de opt-out onder Artikel 4(3) van de DSM-richtlijn.",
        ],
        fields: [field("Beschrijf uw auteursrechtbeleid", 3)],
      },
      {
        heading: "5. Capaciteiten en beperkingen",
        fields: [
          field("Capaciteiten, bekende beperkingen en de risico's van het model", 4),
        ],
      },
      {
        heading: "6. Systeemrisico (Artikel 55)",
        paragraphs: [
          "Bij een cumulatieve trainingsrekenkracht van meer dan 10^25 FLOP gelden aanvullende verplichtingen onder Artikel 55, inclusief melding aan de Europese Commissie (Artikel 52).",
        ],
        fields: [field("Rekenkracht (FLOP) en, indien van toepassing, de systeemrisico-maatregelen", 3)],
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
