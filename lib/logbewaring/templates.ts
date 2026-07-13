// Builds the "Logbewaringsbeleid (Art. 26 lid 6)" evidence document (a
// DocumentContent) from the company's high-risk systems + their retention
// records, so the existing generic <DocumentPdf> can render it. Auto-fills what
// the app knows (the systems + any recorded policy) and leaves ruled fill-in
// lines for systems not yet documented — the "honest fill-in template" idiom.

import type { DocSection, DocumentContent } from "@/lib/documents/templates";
import {
  APPLIES_FROM_NOTE,
  UNDER_CONTROL_NOTE,
  FINANCIAL_NOTE,
  MIN_RETENTION_MONTHS,
  isDocumented,
} from "@/lib/logbewaring/labels";

function field(label: string, lines = 3): NonNullable<DocSection["fields"]>[number] {
  return { label, lines };
}

/** The per-system data the evidence doc needs. */
export interface LogRetentionSystem {
  name: string;
  vendor: string | null;
  logLocation: string | null;
  logRetentionMonths: number | null;
  logRetentionOwner: string | null;
  logReviewedAt: Date | null;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

function fmtMonths(m: number | null): string {
  return m == null ? "—" : `${m} maanden`;
}

export function buildLogRetentionEvidence(
  companyName: string,
  systems: LogRetentionSystem[]
): DocumentContent {
  const undocumented = systems.filter((s) => !isDocumented(s));

  const tableSection: DocSection = {
    heading: "2. Logbewaring per hoog-risico systeem",
    paragraphs: systems.length
      ? undefined
      : [
          "Er zijn nog geen hoog-risico AI-systemen geregistreerd. Zodra u er één inzet, legt u hieronder de logbewaring vast.",
        ],
    table: systems.length
      ? {
          headers: ["Systeem", "Bewaarplaats", "Bewaartermijn", "Verantwoordelijke", "Laatst herzien"],
          rows: systems.map((s) => [
            `${s.name}${s.vendor ? ` (${s.vendor})` : ""}`,
            s.logLocation?.trim() || "— (nog vast te leggen)",
            fmtMonths(s.logRetentionMonths),
            s.logRetentionOwner?.trim() || "—",
            fmtDate(s.logReviewedAt),
          ]),
        }
      : undefined,
    // Ruled fill-in lines for any system whose policy isn't recorded yet.
    fields: undocumented.length
      ? undocumented.map((s) =>
          field(`${s.name} — bewaarplaats, bewaartermijn (≥ ${MIN_RETENTION_MONTHS} mnd) en verantwoordelijke`, 3)
        )
      : systems.length
        ? undefined
        : [field("Systeem — bewaarplaats, bewaartermijn en verantwoordelijke", 4)],
  };

  return {
    title: "Logbewaringsbeleid (Art. 26 lid 6)",
    subtitle: companyName,
    intro:
      `${companyName} legt hierbij vast hoe de automatisch gegenereerde logs van haar hoog-risico AI-systemen worden bewaard, conform Art. 26 lid 6 van de AI-verordening.`,
    sections: [
      {
        heading: "1. Beleid",
        paragraphs: [
          `Wij bewaren de automatisch gegenereerde logs van onze hoog-risico AI-systemen voor een periode die past bij het beoogde doel, en ten minste ${MIN_RETENTION_MONTHS} maanden — voor zover die logs onder onze controle staan (Art. 26 lid 6).`,
        ],
        bullets: [
          "De bewaartermijn is minimaal zes maanden, tenzij Unie- of nationaal recht (in het bijzonder gegevensbeschermingsrecht) een andere termijn voorschrijft.",
          "De logs worden beschermd tegen ongeoorloofde toegang en op verzoek beschikbaar gesteld aan de bevoegde toezichthouder.",
        ],
      },
      tableSection,
      {
        heading: "3. Reikwijdte en uitzonderingen",
        paragraphs: [UNDER_CONTROL_NOTE, FINANCIAL_NOTE],
      },
      {
        heading: "Wettelijke grondslag",
        paragraphs: [
          "Art. 26 lid 6 AI-verordening (Verordening (EU) 2024/1689): gebruiksverantwoordelijken van hoog-risico AI-systemen bewaren de automatisch gegenereerde logs, voor zover onder hun controle, gedurende een passende periode van ten minste zes maanden, tenzij anders bepaald in toepasselijk Unie- of nationaal recht, in het bijzonder inzake de bescherming van persoonsgegevens.",
          APPLIES_FROM_NOTE,
        ],
      },
    ],
  };
}
