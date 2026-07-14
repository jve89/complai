import type { Company, AiSystem } from "@prisma/client";

import { RISK_LABEL, ROLE_LABEL } from "@/lib/register/labels";
import type { ComplianceProfile } from "@/lib/compliance/types";

export type DocumentType =
  | "ai_policy"
  | "risk_assessment"
  | "fria"
  | "dpia"
  | "transparency"
  | "tech_doc"
  | "qms"
  | "postmarket_plan"
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
    type: "dpia",
    name: "DPIA-koppeling (AVG Art. 35)",
    description:
      "Koppelt uw AI-inzet aan uw gegevensbeschermingseffectbeoordeling (AVG Art. 35, AI-Act Art. 26 lid 9).",
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
    type: "qms",
    name: "Kwaliteitsmanagementsysteem (Art. 17)",
    description:
      "Gedocumenteerd kwaliteitsmanagementsysteem voor aanbieders van hoog-risico AI (Artikel 17).",
    highRiskFocused: true,
  },
  {
    type: "postmarket_plan",
    name: "Post-market monitoringplan (Art. 72)",
    description:
      "Plan waarmee de aanbieder de prestaties van een hoog-risico systeem na marktintroductie monitort (Artikel 72, Annex IV).",
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

/** Company context woven into every document so it reads as written-for-you:
 *  identity (with [marker] fallbacks the client completes on the printout) plus
 *  scan-derived role and risk framing from the compliance profile. */
interface DocContext {
  name: string;
  sector: string | null;
  size: string | null;
  country: string;
  address: string;
  kvk: string;
  repName: string;
  repRole: string;
  hasRep: boolean;
  isProvider: boolean;
  isDeployer: boolean;
  roleLine: string;
  headline: ComplianceProfile["headline"] | null;
}

function docContext(company: Company): DocContext {
  const profile = (company.profileJson as unknown as ComplianceProfile | null) ?? null;
  const roles = company.entityRoles ?? [];
  const isProvider = roles.includes("provider");
  const isDeployer = roles.includes("deployer");
  const roleLine =
    isProvider && isDeployer
      ? `${company.name} treedt zowel op als aanbieder als gebruiksverantwoordelijke van AI-systemen.`
      : isProvider
        ? `${company.name} treedt op als aanbieder van AI-systemen.`
        : isDeployer
          ? `${company.name} treedt op als gebruiksverantwoordelijke van AI-systemen.`
          : `${company.name} zet AI-systemen in binnen de organisatie.`;
  return {
    name: company.name,
    sector: company.sector?.trim() || null,
    size: company.size?.trim() || null,
    country: company.country?.trim() || "Nederland",
    address: company.address?.trim() || "[adres]",
    kvk: company.kvk?.trim() ? `KvK ${company.kvk.trim()}` : "[KvK-nummer]",
    repName: company.legalRepName?.trim() || "[naam tekenbevoegde]",
    repRole: company.legalRepRole?.trim() || "[functie]",
    hasRep: Boolean(company.legalRepName?.trim()),
    isProvider,
    isDeployer,
    roleLine,
    headline: profile?.headline ?? null,
  };
}

// ── Builders ─────────────────────────────────────────────────────────────────

function buildAiPolicy(
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  const ctx = docContext(company);
  const high = highRiskSystems(systems);
  const providers = systems.filter((s) => s.role === "provider").length;
  const deployers = systems.length - providers;
  return {
    title: "AI-gebruiksbeleid",
    subtitle: company.name,
    intro: `Dit beleid beschrijft hoe ${ctx.name}${
      ctx.sector ? ` (sector: ${ctx.sector})` : ""
    } omgaat met de ontwikkeling, inkoop en inzet van kunstmatige intelligentie (AI), in lijn met de EU AI Act (Verordening (EU) 2024/1689). ${ctx.roleLine}`,
    sections: [
      {
        heading: "1. Doel en reikwijdte",
        paragraphs: [
          `Dit beleid geldt voor alle medewerkers, inhuurkrachten en AI-systemen binnen ${ctx.name}${
            ctx.size ? ` (organisatiegrootte: ${ctx.size})` : ""
          }. Het doel is AI veilig, transparant en verantwoord in te zetten en te voldoen aan de verplichtingen uit de EU AI Act.`,
          ...(ctx.headline === "high_risk"
            ? [
                `Uit de risicoscan van ${ctx.name} blijkt een hoog-risicoprofiel: één of meer systemen vallen onder een hoog-risicocategorie (Annex III). Dit beleid besteedt daarom bijzondere aandacht aan menselijk toezicht, documentatie en risicobeheersing.`,
              ]
            : ctx.headline === "prohibited"
              ? [
                  `Let op: uw risicoscan signaleerde een mogelijk verboden praktijk (Artikel 5). Toets dit met voorrang — een verboden toepassing mag niet worden ingezet.`,
                ]
              : []),
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
          `${ctx.roleLine} De directie van ${ctx.name} is eindverantwoordelijk voor AI-compliance. ${
            ctx.hasRep
              ? `${ctx.repName} (${ctx.repRole})`
              : "Een aangewezen verantwoordelijke"
          } beheert het AI-register, coördineert risicobeoordelingen en bewaakt de naleving van dit beleid.`,
        ],
      },
      {
        heading: "4. Verboden toepassingen (Artikel 5)",
        paragraphs: [
          "Toepassingen die onder de verboden praktijken van Artikel 5 vallen — zoals social scoring, schadelijke manipulatie, emotieherkenning op de werkvloer of niet-toegestane biometrische identificatie — zijn binnen de organisatie niet toegestaan.",
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
            ? `${ctx.name} houdt een actueel register bij van ${systems.length} ingezette AI-systemen${
                high.length ? `, waarvan ${high.length} met een hoog risico` : ""
              }${
                providers && deployers
                  ? ` (${providers} als aanbieder, ${deployers} als gebruiksverantwoordelijke)`
                  : ""
              }:`
            : "Er zijn op dit moment geen AI-systemen geregistreerd. Registreer uw systemen in het AI-register; dit beleid verwijst er dan automatisch naar.",
        ],
        table: systems.length ? systemsTable(systems) : undefined,
      },
      {
        heading: "8. Toezicht en evaluatie",
        paragraphs: [
          "Dit beleid wordt minimaal jaarlijks geëvalueerd en bijgewerkt naar aanleiding van wijzigingen in wetgeving, technologie of bedrijfsvoering.",
        ],
      },
      {
        heading: "9. Vaststelling",
        paragraphs: [`Dit beleid is namens ${ctx.name} vastgesteld door onderstaande tekenbevoegde.`],
        fields: [
          field(`Vastgesteld door: ${ctx.repName}, ${ctx.repRole} — plaats en datum`, 1),
          field("Handtekening", 2),
        ],
      },
    ],
  };
}

function buildRiskAssessment(
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  const ctx = docContext(company);
  const high = systems.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "unacceptable"
  );
  const providers = systems.filter((s) => s.role === "provider").length;
  const deployers = systems.length - providers;
  return {
    title: "Risicobeoordeling AI-systemen",
    subtitle: company.name,
    intro: `Deze risicobeoordeling brengt de AI-systemen van ${ctx.name}${
      ctx.sector ? ` (sector: ${ctx.sector})` : ""
    } in kaart en classificeert ze volgens het risicokader van de EU AI Act.`,
    sections: [
      {
        heading: "1. Samenvatting",
        paragraphs: [
          systems.length
            ? `Er zijn ${systems.length} AI-systemen beoordeeld, waarvan ${high.length} als hoog of onaanvaardbaar risico ${high.length === 1 ? "is" : "zijn"} geclassificeerd. ${providers} hiervan zet ${ctx.name} in als aanbieder en ${deployers} als gebruiksverantwoordelijke — de rol bepaalt mede welke verplichtingen gelden.`
            : "Er zijn nog geen AI-systemen geregistreerd. Registreer uw systemen in het AI-register; daarna vult deze beoordeling zich automatisch.",
          ...(ctx.headline === "prohibited"
            ? [
                "Let op: de risicoscan signaleerde een mogelijk verboden praktijk (Artikel 5). Beoordeel dit met voorrang; een verboden toepassing mag niet worden ingezet.",
              ]
            : ctx.headline === "high_risk"
              ? [
                  "De risicoscan bevestigt een hoog-risicoprofiel. Besteed bijzondere aandacht aan de hoog-risico systemen hieronder en aan de bijbehorende FRIA, technische documentatie en menselijk toezicht.",
                ]
              : []),
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
  const ctx = docContext(company);
  const high = systems.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "unacceptable"
  );
  return {
    title: "Fundamental Rights Impact Assessment (FRIA)",
    subtitle: company.name,
    intro: `Deze grondrechtentoets (FRIA, Artikel 27) beoordeelt de impact van de hoog-risico AI-systemen van ${ctx.name} op de grondrechten van betrokkenen, conform de EU AI Act.`,
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
          high.length
            ? "Beschrijf per hoog-risico systeem wie erdoor worden geraakt (bijv. sollicitanten, klanten, medewerkers, burgers) en in welke context het wordt ingezet:"
            : "Beschrijf wie door het systeem worden geraakt en in welke context het wordt ingezet.",
        ],
        fields: high.length
          ? high.map((s) =>
              field(
                `${s.name}${s.vendor ? ` (${s.vendor})` : ""} — betrokken groepen en inzetcontext`,
                3
              )
            )
          : [
              field(
                "Betrokken groepen (bijv. sollicitanten, klanten, medewerkers, burgers) en de context van inzet",
                3
              ),
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
        fields: high.length
          ? high.map((s) =>
              field(`${s.name} — geïdentificeerde risico's en de concrete maatregelen`, 4)
            )
          : [field("Uw geïdentificeerde risico's en de concrete maatregelen die u treft", 5)],
      },
      {
        heading: "5. Menselijk toezicht (Artikel 14)",
        fields: high.length
          ? high.map((s) =>
              field(
                `${s.name} — wie houdt toezicht, hoe worden besluiten gecontroleerd en hoe kunnen betrokkenen bezwaar maken?`,
                4
              )
            )
          : [
              field(
                "Wie houdt toezicht, hoe worden besluiten gecontroleerd en hoe kunnen betrokkenen bezwaar maken?",
                4
              ),
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
  const ctx = docContext(company);
  const userFacing = systems.filter(
    (s) => s.riskLevel === "limited" || s.riskLevel === "high"
  );
  return {
    title: "Transparantieverklaring AI (Artikel 50)",
    subtitle: company.name,
    intro: `${ctx.name}${
      ctx.sector ? ` (${ctx.sector})` : ""
    } hecht waarde aan transparantie over de inzet van AI. Deze verklaring beschrijft wanneer en hoe wij u informeren over het gebruik van AI-systemen.`,
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
          ? [
              "De volgende geregistreerde systemen kunnen direct contact hebben met gebruikers of content voortbrengen; bij elk daarvan maakt de organisatie de inzet van AI kenbaar:",
            ]
          : [
              "Op dit moment zijn er geen geregistreerde systemen met directe gebruikersinteractie.",
            ],
        bullets: userFacing.length
          ? userFacing.map(
              (s) =>
                `${s.name}${s.vendor ? ` (${s.vendor})` : ""} — gebruikers worden geïnformeerd dat zij met een AI-systeem te maken hebben of dat content door AI is gegenereerd (Art. 50).`
            )
          : undefined,
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
          `Heeft u vragen over ons gebruik van AI? Neem dan contact op met ${ctx.name} via onderstaande contactgegevens.`,
        ],
        fields: [field("Contactgegevens voor vragen over AI (e-mail / telefoon)", 1)],
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
  const ctx = docContext(company);
  const high = highRiskSystems(systems);
  return {
    title: "Technische documentatie (Annex IV)",
    subtitle: company.name,
    intro: `Dit technisch dossier beschrijft de hoog-risico AI-systemen van ${ctx.name} conform Artikel 11 en Annex IV van de EU AI Act. ${
      ctx.isProvider
        ? "Als aanbieder stelt u dit dossier op en houdt u het actueel."
        : "Vul de onderdelen per systeem aan met uw eigen technische gegevens."
    } De technische onderdelen hieronder vult u zelf in — die kennen alleen uw ontwikkelaars of leverancier.`,
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
        fields: high.length
          ? high.map((s) =>
              field(
                `${s.name}${s.vendor ? ` (${s.vendor})` : ""} — architectuur, gebruikte modellen/algoritmen en de belangrijkste ontwerpkeuzes`,
                4
              )
            )
          : [
              field(
                "Architectuur, gebruikte modellen/algoritmen en de belangrijkste ontwerpkeuzes",
                5
              ),
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
  // Identity via docContext; filled fields render, blanks keep a [marker].
  const ctx = docContext(company);
  const high = highRiskSystems(systems);
  return {
    title: "EU-conformiteitsverklaring",
    subtitle: company.name,
    intro: `Deze verklaring wordt door de aanbieder opgesteld conform Artikel 47 van de EU AI Act. Vul de gegevens aan, controleer de inhoud en stel de verklaring formeel vast.`,
    sections: [
      {
        heading: "1. Aanbieder",
        paragraphs: [
          `${ctx.name}, ${ctx.address}, ${ctx.kvk}, ${ctx.country}, [contactgegevens].`,
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
        paragraphs: [`Namens ${ctx.name}: ${ctx.repName}, ${ctx.repRole}.`],
        fields: [
          field("Plaats en datum", 1),
          field("Handtekening", 2),
        ],
      },
    ],
  };
}

function buildAssessmentRecord(company: Company, systems: AiSystem[]): DocumentContent {
  const ctx = docContext(company);
  return {
    title: "Beoordelingsdossier — niet-hoog-risico (Art. 6(3))",
    subtitle: company.name,
    intro: `Dit dossier legt vast waarom een AI-systeem dat onder een Annex III-gebied valt, volgens de beoordeling van ${ctx.name} geen significant risico vormt voor gezondheid, veiligheid of grondrechten (Artikel 6(3)). Leg deze beoordeling vast vóór ingebruikname (Artikel 6(4)).`,
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
  const ctx = docContext(company);
  return {
    title: "Documentatie AI-model voor algemene doeleinden (GPAI)",
    subtitle: company.name,
    intro: `Deze documentatie hoort bij een AI-model voor algemene doeleinden (GPAI) dat ${ctx.name} op de markt brengt, conform Artikel 53 en Annex XI/XII van de EU AI Act. De technische gegevens hieronder (architectuur, trainingsproces, rekenkracht) vult u zelf in — die zijn specifiek voor uw model.`,
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

/** DPIA-koppeling — a LIGHT linkage, not a full DPIA. The DPIA itself is an AVG
 *  (GDPR) Art 35 instrument that is in force TODAY; the AI-Act only says a deployer
 *  must use the provider's Art 13 information for it (Art 26(9)) and that the FRIA
 *  complements it (Art 27(4)). So this document maps what the company's AI dossier
 *  already produces onto the DPIA, leaves the AVG-specific analysis as fill-in, and
 *  is explicit that it is not a substitute for a DPIA, an AVG tool, or legal advice. */
function buildDpia(company: Company, systems: AiSystem[]): DocumentContent {
  const ctx = docContext(company);
  const high = highRiskSystems(systems);
  return {
    title: "DPIA-koppeling (AVG Art. 35 & AI-verordening)",
    subtitle: company.name,
    intro: `Dit hulpmiddel koppelt de AI-inzet van ${ctx.name} aan de gegevensbeschermingseffectbeoordeling (DPIA) onder de AVG (Art. 35). De AI-verordening verplicht u de informatie van de aanbieder (Art. 13) te gebruiken voor uw DPIA (Art. 26 lid 9) en laat de grondrechtentoets (FRIA, Art. 27) de DPIA aanvullen (Art. 27 lid 4). Dit is een koppeling en checklist — geen volledige DPIA, geen AVG-tool en geen juridisch advies.`,
    sections: [
      {
        heading: "1. Wanneer een DPIA (AVG Art. 35)",
        paragraphs: [
          "Een DPIA is onder de AVG vereist wanneer een verwerking waarschijnlijk een hoog risico oplevert voor de rechten en vrijheden van personen — bijvoorbeeld bij grootschalige profilering of systematische, geautomatiseerde besluitvorming. Deze plicht geldt nu al onder de AVG en staat los van de AI-verordening.",
        ],
        bullets: [
          "Verwerkt uw hoog-risico AI-systeem persoonsgegevens? Dan is een DPIA doorgaans vereist (AVG Art. 35).",
          "De AI-verordening vervangt de DPIA niet — DPIA (AVG) en FRIA (AI-verordening) gelden naast elkaar.",
        ],
        fields: [field("Is voor uw AI-verwerking een DPIA vereist? Onderbouw kort (AVG Art. 35).", 2)],
      },
      {
        heading: "2. Wat uw AI-dossier al oplevert voor de DPIA (Art. 26 lid 9)",
        paragraphs: [
          high.length
            ? "Op grond van Art. 26 lid 9 gebruikt u de informatie van de aanbieder (Art. 13) voor uw DPIA. De volgende hoog-risico systemen vergen het meest waarschijnlijk een DPIA; neem de onderstaande gegevens over in de beoordeling:"
            : "Op grond van Art. 26 lid 9 gebruikt u de informatie van de aanbieder (Art. 13) voor uw DPIA. Ga per AI-systeem na of het persoonsgegevens met een hoog risico verwerkt; neem de onderstaande gegevens over in de beoordeling:",
        ],
        table: high.length ? systemsTable(high) : undefined,
        bullets: [
          "Doel en werking van het systeem — uit uw AI-register en de gebruiksaanwijzing (Art. 13 lid 3(b)(i)).",
          "Nauwkeurigheid, robuustheid en beperkingen — uit de instructies van de aanbieder (Art. 13 lid 3(b)(ii)).",
          "Risico's voor grondrechten en betrokken groepen — uit uw FRIA (Art. 27) en Art. 13 lid 3(b)(iii)/(v).",
          "Menselijk toezicht — uit uw toezichtregister (Art. 26 lid 2 / Art. 14) en Art. 13 lid 3(d).",
          "Logging en bewaartermijn — uit uw logbewaring (Art. 26 lid 6).",
        ],
      },
      {
        heading: "3. DPIA-onderdelen om zelf in te vullen (AVG Art. 35 lid 7)",
        paragraphs: [
          "De AVG vereist ten minste de volgende onderdelen. Vul deze aan met uw eigen analyse — de AI-verordening levert de input, maar niet de DPIA zelf:",
        ],
        fields: [
          field("Systematische beschrijving van de verwerking en het doel", 4),
          field("Beoordeling van de noodzaak en evenredigheid van de verwerking", 3),
          field("Risico's voor de rechten en vrijheden van betrokkenen", 4),
          field("Maatregelen om de risico's te beperken (waarborgen, beveiliging, betrokkenheid)", 4),
          field("Advies van de functionaris voor gegevensbescherming (FG), indien aangesteld", 2),
        ],
      },
      {
        heading: "4. FRIA en DPIA (Art. 27 lid 4)",
        paragraphs: [
          "Waar een onderdeel van uw grondrechtentoets (FRIA) al in de DPIA is behandeld, vult de FRIA de DPIA aan — u doet dat werk niet dubbel (Art. 27 lid 4). De DPIA blijft de basis vanuit de AVG; de FRIA is de aanvulling vanuit de AI-verordening.",
        ],
      },
      {
        heading: "Wettelijke grondslag en reikwijdte",
        paragraphs: [
          "AVG (Verordening (EU) 2016/679) Art. 35: verplichting tot een gegevensbeschermingseffectbeoordeling bij hoog-risico verwerking. AI-verordening Art. 26 lid 9: gebruik de informatie van de aanbieder (Art. 13) voor die DPIA. AI-verordening Art. 27 lid 4: de FRIA vult de DPIA aan.",
          "De DPIA-plicht geldt nu al onder de AVG. De AI-verordening-koppeling (Art. 26 lid 9) wordt met de overige Annex III hoog-risico-verplichtingen van toepassing vanaf 2 december 2027 (onder voorbehoud — wetgeving kan nog wijzigen).",
          "Dit document is een hulpmiddel om uw AI-inzet aan uw DPIA te koppelen. Het is geen volledige DPIA, geen AVG-tool en geen juridisch advies.",
        ],
      },
    ],
  };
}

/** Quality management system (Art 17) — a fill-in scaffold for the 13 elements a
 *  PROVIDER's QMS must document. Art 17 binds only aanbieders (makers) of high-risk
 *  AI, so the doc opens by telling a pure gebruiksverantwoordelijke it does not
 *  apply to them, and states the Art 63(1) microenterprise-only simplification
 *  (pending Commission guidelines; Art 63(2) preserves all other duties). Each
 *  Art 17(1)(a)–(m) element is a ruled fill-in — the substance is provider-specific. */
function buildQms(company: Company, systems: AiSystem[]): DocumentContent {
  const ctx = docContext(company);
  const high = highRiskSystems(systems);
  return {
    title: "Kwaliteitsmanagementsysteem (Artikel 17)",
    subtitle: company.name,
    intro: `Dit sjabloon helpt aanbieders van hoog-risico AI-systemen een kwaliteitsmanagementsysteem (KMS) vast te leggen conform Artikel 17 van de EU AI Act. ${
      ctx.isProvider
        ? "Als aanbieder legt u dit systeem vast in schriftelijke beleidsregels, procedures en instructies en houdt u het actueel."
        : "Let op: een KMS is een verplichting voor de aanbieder (maker) van een hoog-risico systeem. Bent u uitsluitend gebruiksverantwoordelijke, dan geldt Artikel 17 niet voor u."
    } De inhoud per onderdeel vult u zelf in — die is specifiek voor uw organisatie en systemen.`,
    sections: [
      {
        heading: "Voor wie geldt dit? (Artikel 16/17)",
        paragraphs: [
          "Artikel 17 verplicht alleen de aanbieder van een hoog-risico AI-systeem tot een kwaliteitsmanagementsysteem. Een gebruiksverantwoordelijke (deployer) hoeft geen KMS te hebben.",
          "Micro-ondernemingen (minder dan 10 werknemers én ten hoogste € 2 mln omzet of balanstotaal, zonder partner- of verbonden ondernemingen) mogen bepaalde onderdelen vereenvoudigd invullen (Artikel 63 lid 1); de Europese Commissie werkt hiervoor nog richtsnoeren uit. Deze vereenvoudiging ontslaat u niet van de overige verplichtingen (o.a. Artikelen 9, 10, 11, 12, 13, 14, 15, 72 en 73 — Artikel 63 lid 2).",
        ],
        table: high.length ? systemsTable(high) : undefined,
      },
      {
        heading: "1. Strategie voor naleving (Art. 17 lid 1(a))",
        fields: [
          field(
            "Uw strategie voor regelgevingsnaleving, inclusief de conformiteitsbeoordeling en het beheer van wijzigingen aan het systeem",
            4
          ),
        ],
      },
      {
        heading: "2. Ontwerp en ontwerpverificatie (Art. 17 lid 1(b))",
        fields: [field("Technieken en procedures voor ontwerp, ontwerpcontrole en ontwerpverificatie", 3)],
      },
      {
        heading: "3. Ontwikkeling en kwaliteitsborging (Art. 17 lid 1(c))",
        fields: [field("Technieken en procedures voor ontwikkeling, kwaliteitscontrole en kwaliteitsborging", 3)],
      },
      {
        heading: "4. Test- en validatieprocedures (Art. 17 lid 1(d))",
        fields: [
          field(
            "Onderzoeks-, test- en validatieprocedures vóór, tijdens en na de ontwikkeling — en hoe vaak deze worden uitgevoerd",
            3
          ),
        ],
      },
      {
        heading: "5. Technische specificaties en normen (Art. 17 lid 1(e))",
        fields: [
          field(
            "Toegepaste technische specificaties en normen; en waar geharmoniseerde normen niet volledig gelden, hoe u toch aan de eisen van Sectie 2 voldoet",
            3
          ),
        ],
      },
      {
        heading: "6. Datamanagement (Art. 17 lid 1(f))",
        fields: [
          field(
            "Systemen en procedures voor datamanagement (verzameling, labeling, opslag, filtering, aggregatie en bewaring) vóór en met het oog op het in de handel brengen",
            4
          ),
        ],
      },
      {
        heading: "7. Risicobeheersysteem (Art. 17 lid 1(g) → Artikel 9)",
        fields: [
          field("Verwijs naar uw risicobeheersysteem (Artikel 9) — bijvoorbeeld uw risicobeoordeling en FRIA", 2),
        ],
      },
      {
        heading: "8. Post-market monitoring (Art. 17 lid 1(h) → Artikel 72)",
        fields: [field("Opzet, uitvoering en onderhoud van uw post-market monitoringsysteem (Artikel 72)", 3)],
      },
      {
        heading: "9. Melding van ernstige incidenten (Art. 17 lid 1(i) → Artikel 73)",
        fields: [field("Procedures voor het melden van ernstige incidenten (Artikel 73)", 2)],
      },
      {
        heading: "10. Communicatie met autoriteiten (Art. 17 lid 1(j))",
        fields: [
          field(
            "Hoe u communiceert met markttoezichthouders, aangemelde instanties, andere operatoren, klanten en andere belanghebbenden",
            3
          ),
        ],
      },
      {
        heading: "11. Documentatiebeheer (Art. 17 lid 1(k))",
        fields: [field("Systemen en procedures voor het bewaren van alle relevante documentatie en informatie", 2)],
      },
      {
        heading: "12. Resource- en leveringszekerheid (Art. 17 lid 1(l))",
        fields: [field("Resourcemanagement, inclusief maatregelen voor leveringszekerheid", 2)],
      },
      {
        heading: "13. Verantwoordingskader (Art. 17 lid 1(m))",
        fields: [
          field(
            "Verantwoordelijkheden van het management en de overige medewerkers voor alle bovengenoemde onderdelen",
            3
          ),
        ],
      },
      {
        heading: "Evenredigheid en uitzonderingen (Art. 17 lid 2–4)",
        paragraphs: [
          "De uitvoering is evenredig aan de omvang van uw organisatie, maar de vereiste striktheid en het beschermingsniveau blijven gewaarborgd (Artikel 17 lid 2).",
          "Valt u al onder kwaliteitsmanagement-eisen uit sectoraal Unierecht, dan mag u de bovenstaande onderdelen daarin integreren (Artikel 17 lid 3). Financiële instellingen worden geacht te voldoen via hun interne governance, met uitzondering van de onderdelen (g), (h) en (i) (Artikel 17 lid 4).",
        ],
      },
      {
        heading: "Wettelijke grondslag",
        paragraphs: [
          "Artikel 17 van Verordening (EU) 2024/1689 (de AI Act): aanbieders van hoog-risico AI-systemen beschikken over een gedocumenteerd kwaliteitsmanagementsysteem.",
          "Deze verplichting voor Annex III hoog-risico systemen is van toepassing vanaf 2 december 2027 (voor AI in gereguleerde producten, Annex I: 2 augustus 2028) — uitgestelde datum onder de Digital Omnibus, onder voorbehoud; wetgeving kan nog wijzigen.",
          "Dit is een bewerkbaar concept-sjabloon en geen juridisch advies.",
        ],
      },
    ],
  };
}

/** Post-market monitoring plan (Art 72) — a fill-in scaffold for the PROVIDER's
 *  post-market monitoring system + plan. This is the provider's Art 72 duty, NOT
 *  the deployer's ongoing Art 26(5) monitoring (which lives in the kwartaalcheck) —
 *  the doc says so up front. The plan is Annex IV point 9 of the technical
 *  documentation (Art 11); the Commission adopts a mandatory template by 2 Feb 2026,
 *  so the copy frames this as preparation to align with that final model. */
function buildPostmarketPlan(company: Company, systems: AiSystem[]): DocumentContent {
  const ctx = docContext(company);
  const high = highRiskSystems(systems);
  return {
    title: "Post-market monitoringplan (Artikel 72)",
    subtitle: company.name,
    intro: `Dit sjabloon helpt aanbieders van hoog-risico AI-systemen een post-market monitoringplan vast te leggen conform Artikel 72 van de EU AI Act. ${
      ctx.isProvider
        ? "Als aanbieder zet u een monitoringsysteem op, documenteert u het plan en houdt u het actueel."
        : "Let op: het post-market monitoringsysteem en -plan (Artikel 72) is een verplichting voor de aanbieder (maker). Bent u uitsluitend gebruiksverantwoordelijke, dan geldt Artikel 72 niet voor u — uw eigen monitoringplicht staat in Artikel 26 lid 5 (zie uw kwartaalcheck)."
    } De inhoud vult u zelf in — die is specifiek voor uw systemen.`,
    sections: [
      {
        heading: "Voor wie geldt dit? (Artikel 72)",
        paragraphs: [
          "Artikel 72 verplicht alleen de aanbieder van een hoog-risico AI-systeem tot een post-market monitoringsysteem en -plan. Dit staat los van de doorlopende monitoringplicht van de gebruiksverantwoordelijke (Artikel 26 lid 5).",
          "Het plan is onderdeel van uw technische documentatie (Annex IV, punt 9 — Artikel 11). Het mkb mag de onderdelen van die technische documentatie vereenvoudigd aanleveren (Artikel 11 lid 1).",
          "De Europese Commissie stelt uiterlijk 2 februari 2026 een verplicht sjabloon en een lijst met elementen voor het plan vast (Artikel 72 lid 3). Gebruik dit sjabloon als voorbereiding en stem het af op het definitieve model zodra dat er is.",
        ],
        table: high.length ? systemsTable(high) : undefined,
      },
      {
        heading: "1. Reikwijdte en evenredigheid (Art. 72 lid 1)",
        fields: [
          field(
            "Welke hoog-risico systemen vallen onder dit plan, en hoe is het monitoringsysteem evenredig aan de aard en risico's ervan?",
            3
          ),
        ],
      },
      {
        heading: "2. Gegevensverzameling (Art. 72 lid 2)",
        fields: [
          field(
            "Welke prestatiegegevens verzamelt u — van gebruiksverantwoordelijken en uit andere bronnen — gedurende de hele levensduur van het systeem?",
            4
          ),
        ],
      },
      {
        heading: "3. Analyse en continue naleving (Art. 72 lid 2)",
        fields: [
          field(
            "Hoe analyseert u die gegevens om de voortdurende naleving van Hoofdstuk III, Sectie 2 te beoordelen?",
            3
          ),
        ],
      },
      {
        heading: "4. Interactie met andere AI-systemen (Art. 72 lid 2)",
        fields: [field("Waar relevant: hoe monitort u de interactie met andere AI-systemen?", 2)],
      },
      {
        heading: "5. Indicatoren, drempels en frequentie",
        fields: [field("Welke indicatoren en drempelwaarden volgt u, en met welke frequentie?", 3)],
      },
      {
        heading: "6. Opvolging: corrigerende maatregelen en meldingen (Art. 20 / 73)",
        fields: [
          field(
            "Hoe leiden monitoringsignalen tot corrigerende maatregelen (Artikel 20) en, waar nodig, tot melding van ernstige incidenten (Artikel 73)?",
            3
          ),
        ],
      },
      {
        heading: "7. Verantwoordelijkheden en actualisering",
        fields: [
          field("Wie is verantwoordelijk voor de monitoring, en hoe vaak wordt het plan herzien en bijgewerkt?", 2),
        ],
      },
      {
        heading: "Plaats in de technische documentatie (Annex IV punt 9)",
        paragraphs: [
          "Dit plan vormt punt 9 van uw technische documentatie (Annex IV) en beschrijft het systeem waarmee u de prestaties van het AI-systeem in de post-market fase evalueert (Artikel 72 lid 3).",
        ],
      },
      {
        heading: "Uitzonderingen (Art. 72 lid 4)",
        paragraphs: [
          "Voor producten onder de Uniewetgeving in Annex I (Sectie A) en voor Annex III punt 5-systemen van financiële instellingen mag u de elementen integreren in een al bestaand sectoraal monitoringplan, mits een gelijkwaardig beschermingsniveau wordt bereikt (Artikel 72 lid 4).",
        ],
      },
      {
        heading: "Wettelijke grondslag",
        paragraphs: [
          "Artikel 72 van Verordening (EU) 2024/1689 (de AI Act): aanbieders van hoog-risico AI-systemen zetten een post-market monitoringsysteem op, gebaseerd op een gedocumenteerd monitoringplan dat deel uitmaakt van de technische documentatie (Annex IV).",
          "Deze verplichting voor Annex III hoog-risico systemen is van toepassing vanaf 2 december 2027 (voor AI in gereguleerde producten, Annex I: 2 augustus 2028) — uitgestelde datum onder de Digital Omnibus, onder voorbehoud; wetgeving kan nog wijzigen.",
          "Dit is een bewerkbaar concept-sjabloon en geen juridisch advies.",
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
  dpia: buildDpia,
  transparency: buildTransparency,
  tech_doc: buildTechDoc,
  qms: buildQms,
  postmarket_plan: buildPostmarketPlan,
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
