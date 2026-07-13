// Builds a fill-in notice/explanation document (a DocumentContent) from a Notice
// record, so the existing generic <DocumentPdf> can render it — the same "honest
// fill-in template" idiom as lib/documents/templates.ts (auto-fill what the app
// knows, ruled lines for the rest). Every builder cites its article verbatim-
// grounded (Art 26(7), 26(11), 86) and carries the applies-from caveat.

import type { DocSection, DocumentContent } from "@/lib/documents/templates";
import {
  APPLIES_FROM_NOTE,
  EXPLANATION_SCOPE_NOTE,
  type NoticeType,
} from "@/lib/kennisgevingen/labels";

/** Shorthand for a fill-in field (label above N ruled lines). */
function field(label: string, lines = 3): NonNullable<DocSection["fields"]>[number] {
  return { label, lines };
}

/** Minimal shape the builder needs from a Notice row. */
export interface NoticeInput {
  type: string;
  recipient: string;
  detail: string | null;
  issuedAt: Date | null;
  status: string;
}

export interface NoticeSystem {
  name: string;
  vendor: string | null;
}

function systemLine(system: NoticeSystem | null): string {
  if (!system) return "";
  return `Het betreft: ${system.name}${system.vendor ? ` (${system.vendor})` : ""}.`;
}

function issuedLine(notice: NoticeInput): string | null {
  if (notice.status !== "issued" || !notice.issuedAt) return null;
  const date = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(
    notice.issuedAt
  );
  return `Verstrekt op ${date}.`;
}

/** Legal-basis section closing every notice — the article + the applies-from caveat. */
function basisSection(paragraphs: string[]): DocSection {
  return { heading: "Wettelijke grondslag", paragraphs: [...paragraphs, APPLIES_FROM_NOTE] };
}

function buildWorker(
  companyName: string,
  notice: NoticeInput,
  system: NoticeSystem | null
): DocumentContent {
  const sysLine = systemLine(system);
  return {
    title: "Kennisgeving: inzet van AI op de werkvloer",
    subtitle: `Gericht aan: ${notice.recipient}`,
    intro:
      `${companyName} informeert hierbij de ondernemingsraad of personeelsvertegenwoordiging en de betrokken werknemers over de inzet van een AI-systeem met hoog risico op de werkvloer, vóórdat dit in gebruik wordt genomen (Art. 26 lid 7 AI-verordening).` +
      (issuedLine(notice) ? ` ${issuedLine(notice)}` : ""),
    sections: [
      {
        heading: "1. Het AI-systeem",
        paragraphs: sysLine ? [sysLine] : undefined,
        fields: [
          ...(sysLine ? [] : [field("Naam en leverancier van het AI-systeem", 1)]),
          field("Waarvoor wordt het systeem gebruikt op de werkvloer?", 3),
        ],
      },
      {
        heading: "2. Wat dit voor u betekent",
        paragraphs: [
          "U wordt bij (de voorbereiding van) besluiten of taken onderworpen aan de werking van dit AI-systeem. Er blijft betekenisvol menselijk toezicht op de inzet (Art. 14).",
        ],
        bullets: [
          "Het systeem ondersteunt de menselijke beoordeling en vervangt die niet.",
          "U kunt met vragen of bezwaren terecht bij de hieronder genoemde contactpersoon.",
        ],
        fields: [field("Vanaf welke datum wordt het systeem ingezet?", 1)],
      },
      {
        heading: "3. Informatie aan de vertegenwoordiging",
        paragraphs: [
          "Deze informatie wordt verstrekt conform de geldende regels en procedures voor informatie aan werknemers en hun vertegenwoordigers (Unie- en nationaal recht).",
        ],
        fields: [
          field("Datum van informeren OR/personeelsvertegenwoordiging", 1),
          field("Contactpersoon voor vragen (naam / e-mail)", 1),
        ],
      },
      {
        heading: "4. Ondertekening",
        fields: [field("Naam en functie", 1), field("Datum", 1), field("Handtekening", 2)],
      },
      basisSection([
        "Art. 26 lid 7 AI-verordening (Verordening (EU) 2024/1689): gebruiksverantwoordelijken die werkgever zijn informeren, vóór ingebruikname van een hoog-risico AI-systeem op de werkvloer, de werknemersvertegenwoordiging en de betrokken werknemers dat zij aan het systeem onderworpen worden.",
      ]),
    ],
  };
}

function buildAffected(
  companyName: string,
  notice: NoticeInput,
  system: NoticeSystem | null
): DocumentContent {
  const sysLine = systemLine(system);
  return {
    title: "Kennisgeving: gebruik van AI bij besluitvorming over u",
    subtitle: `Gericht aan: ${notice.recipient}`,
    intro:
      `${companyName} laat u weten dat bij (de voorbereiding van) besluiten die u betreffen gebruik wordt gemaakt van een AI-systeem met hoog risico (Annex III), conform Art. 26 lid 11 AI-verordening.` +
      (issuedLine(notice) ? ` ${issuedLine(notice)}` : ""),
    sections: [
      {
        heading: "1. Het AI-systeem en waarvoor het wordt gebruikt",
        paragraphs: sysLine ? [sysLine] : undefined,
        fields: [
          ...(sysLine ? [] : [field("Naam van het AI-systeem", 1)]),
          field("Waarvoor wordt het systeem gebruikt in besluiten over u?", 3),
        ],
      },
      {
        heading: "2. Wat dit voor u betekent",
        paragraphs: [
          "Er wordt een AI-systeem met hoog risico toegepast dat besluiten over u neemt of daarbij helpt. Er blijft menselijke betrokkenheid bij het uiteindelijke besluit.",
        ],
        bullets: [
          "U kunt om een toelichting vragen op de rol van het AI-systeem in het besluit (Art. 86).",
          "U kunt een menselijke heroverweging vragen waar dat van toepassing is.",
          "Overige rechten uit het Unierecht (zoals de AVG) blijven onverkort gelden.",
        ],
      },
      {
        heading: "3. Contact",
        fields: [field("Contactgegevens voor vragen of bezwaar (naam / e-mail / telefoon)", 2)],
      },
      basisSection([
        "Art. 26 lid 11 AI-verordening: gebruiksverantwoordelijken van hoog-risico Annex III-systemen die beslissingen over natuurlijke personen nemen of daarbij helpen, informeren die personen dat een hoog-risico AI-systeem op hen wordt toegepast (onverminderd Art. 50).",
      ]),
    ],
  };
}

function buildExplanation(
  companyName: string,
  notice: NoticeInput,
  system: NoticeSystem | null
): DocumentContent {
  const sysLine = systemLine(system);
  return {
    title: "Uitleg bij een besluit met AI-ondersteuning",
    subtitle: `Gericht aan: ${notice.recipient}`,
    intro:
      `Op grond van Art. 86 AI-verordening heeft u recht op een heldere en betekenisvolle uitleg over de rol van het AI-systeem in een besluit dat u aanzienlijk raakt. Hieronder geeft ${companyName} die uitleg.` +
      (issuedLine(notice) ? ` ${issuedLine(notice)}` : ""),
    sections: [
      {
        heading: "1. Het besluit",
        fields: [field("Welk besluit betreft het?", 2), field("Datum van het besluit", 1)],
      },
      {
        heading: "2. De rol van het AI-systeem",
        paragraphs: [
          (sysLine ? `${sysLine} ` : "") +
            "Dit systeem leverde output die is meegewogen in het besluit.",
        ],
        fields: [
          field("Welke output leverde het AI-systeem (bijv. score, classificatie, advies)?", 3),
          field("Hoe zwaar woog die output mee en was er menselijke tussenkomst?", 3),
        ],
      },
      {
        heading: "3. De hoofdelementen van het besluit",
        paragraphs: notice.detail ? [notice.detail] : undefined,
        fields: [
          field("De belangrijkste factoren en gegevens die tot het besluit hebben geleid", 4),
          field("De uitkomst en de motivering", 3),
        ],
      },
      {
        heading: "4. Uw mogelijkheden",
        bullets: [
          "U kunt een menselijke heroverweging van het besluit vragen.",
          "U kunt bezwaar maken volgens de geldende procedures.",
          "Waar een vergelijkbaar recht al uit het Unierecht volgt (bv. art. 22 AVG), geldt dat recht.",
        ],
        fields: [field("Contactpersoon voor vragen over deze uitleg (naam / e-mail)", 1)],
      },
      basisSection([
        "Art. 86 AI-verordening: recht op uitleg bij individuele besluitvorming.",
        EXPLANATION_SCOPE_NOTE,
      ]),
    ],
  };
}

const BUILDERS: Record<
  NoticeType,
  (companyName: string, notice: NoticeInput, system: NoticeSystem | null) => DocumentContent
> = {
  worker: buildWorker,
  affected: buildAffected,
  explanation: buildExplanation,
};

/** Build the notice/explanation document for a Notice row. Falls back to the
 *  worker template for an unknown type (should never happen — type is validated
 *  on write). */
export function buildNoticeContent(
  notice: NoticeInput,
  companyName: string,
  system: NoticeSystem | null
): DocumentContent {
  const builder = BUILDERS[notice.type as NoticeType] ?? buildWorker;
  return builder(companyName, notice, system);
}
