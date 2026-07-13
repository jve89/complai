// Builds the "Klachtenprocedure & -register" evidence document (a DocumentContent)
// from the company's logged complaints, rendered by the existing generic
// <DocumentPdf>. Describes the complaint procedure (incl. the Art 85 external
// route) and tabulates the register — good governance, and evidence of the
// Art 27(1)(f) internal complaint mechanism where a FRIA applies.

import type { DocSection, DocumentContent } from "@/lib/documents/templates";
import {
  ART_85_NOTE,
  SCOPE_NOTE,
  STATUS_LABEL,
  type ComplaintStatus,
} from "@/lib/klachten/labels";

function field(label: string, lines = 3): NonNullable<DocSection["fields"]>[number] {
  return { label, lines };
}

/** The per-complaint data the register needs. */
export interface ComplaintRow {
  subject: string;
  aiSystem: { name: string } | null;
  status: string;
  receivedAt: Date;
  resolvedAt: Date | null;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export function buildComplaintsRegister(
  companyName: string,
  complaints: ComplaintRow[]
): DocumentContent {
  const registerSection: DocSection = {
    heading: "2. Geregistreerde klachten",
    paragraphs: complaints.length
      ? undefined
      : ["Er zijn nog geen klachten geregistreerd. Nieuwe klachten legt u hieronder vast."],
    table: complaints.length
      ? {
          headers: ["Onderwerp", "Systeem", "Ontvangen", "Status", "Afgehandeld"],
          rows: complaints.map((c) => [
            c.subject,
            c.aiSystem?.name || "—",
            fmtDate(c.receivedAt),
            STATUS_LABEL[c.status as ComplaintStatus] ?? c.status,
            fmtDate(c.resolvedAt),
          ]),
        }
      : undefined,
    fields: complaints.length ? undefined : [field("Onderwerp, systeem, datum en afhandeling", 4)],
  };

  return {
    title: "Klachtenprocedure & -register",
    subtitle: companyName,
    intro:
      `${companyName} legt hierbij vast hoe klachten over de inzet van haar AI-systemen worden ontvangen, behandeld en waar nodig doorverwezen.`,
    sections: [
      {
        heading: "1. Klachtenprocedure",
        paragraphs: [
          "Klachten over een AI-systeem worden geregistreerd, in behandeling genomen en afgehandeld. De klager ontvangt een ontvangstbevestiging en, waar mogelijk, een toelichting op de uitkomst.",
        ],
        bullets: [
          "Ontvangst: klachten kunnen per e-mail, brief, telefoon, webformulier of mondeling binnenkomen.",
          "Behandeling: elke klacht krijgt een verantwoordelijke behandelaar en wordt binnen een redelijke termijn opgepakt.",
          "Escalatie: de klager kan de klacht daarnaast altijd voorleggen aan de markttoezichthouder (Art. 85).",
        ],
        fields: [
          field("Contactpunt voor klachten (naam / e-mail)", 1),
          field("Streeftermijn voor afhandeling", 1),
        ],
      },
      registerSection,
      {
        heading: "3. Externe klachtroute (Art. 85)",
        paragraphs: [ART_85_NOTE],
      },
      {
        heading: "Reikwijdte en wettelijke grondslag",
        paragraphs: [
          "Art. 85 AI-verordening (Verordening (EU) 2024/1689): recht om een klacht in te dienen bij de markttoezichthouder. Art. 27 lid 1(f): het interne klachtenmechanisme dat een FRIA-plichtige gebruiksverantwoordelijke in de grondrechtentoets beschrijft.",
          SCOPE_NOTE,
        ],
      },
    ],
  };
}
