import type { Company, AiSystem } from "@prisma/client";

import { RISK_LABEL, ROLE_LABEL } from "@/lib/register/labels";

export type DocumentType =
  | "ai_policy"
  | "risk_assessment"
  | "fria"
  | "transparency";

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

const BUILDERS: Record<
  DocumentType,
  (company: Company, systems: AiSystem[]) => DocumentContent
> = {
  ai_policy: buildAiPolicy,
  risk_assessment: buildRiskAssessment,
  fria: buildFria,
  transparency: buildTransparency,
};

export function buildDocument(
  type: DocumentType,
  company: Company,
  systems: AiSystem[]
): DocumentContent {
  return BUILDERS[type](company, systems);
}
