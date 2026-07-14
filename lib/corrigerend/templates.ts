// Builds the "Register corrigerende maatregelen (Art. 20)" evidence document (a
// DocumentContent) from the company's corrective actions, rendered by the existing
// generic <DocumentPdf>. Provider-scoped; cites Art 20.

import type { DocSection, DocumentContent } from "@/lib/documents/templates";
import {
  ACTION_LABEL,
  STATUS_LABEL,
  PROVIDER_NOTE,
  RISK_NOTE,
  APPLIES_FROM_NOTE,
  type ActionType,
  type CorrectiveStatus,
} from "@/lib/corrigerend/labels";

function field(label: string, lines = 3): NonNullable<DocSection["fields"]>[number] {
  return { label, lines };
}

export interface CorrectiveRow {
  title: string;
  aiSystem: { name: string } | null;
  actionType: string;
  presentsRisk: boolean;
  identifiedAt: Date;
  resolvedAt: Date | null;
  status: string;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export function buildCorrectiveRegister(
  companyName: string,
  rows: CorrectiveRow[]
): DocumentContent {
  const registerSection: DocSection = {
    heading: "1. Geregistreerde corrigerende maatregelen",
    paragraphs: rows.length
      ? undefined
      : ["Er zijn nog geen corrigerende maatregelen geregistreerd. Nieuwe maatregelen legt u hieronder vast."],
    table: rows.length
      ? {
          headers: ["Non-conformiteit", "Systeem", "Maatregel", "Art. 79(1)-risico", "Vastgesteld", "Status"],
          rows: rows.map((r) => [
            r.title,
            r.aiSystem?.name || "—",
            ACTION_LABEL[r.actionType as ActionType] ?? r.actionType,
            r.presentsRisk ? "Ja" : "Nee",
            fmtDate(r.identifiedAt),
            STATUS_LABEL[r.status as CorrectiveStatus] ?? r.status,
          ]),
        }
      : undefined,
    fields: rows.length
      ? undefined
      : [field("Non-conformiteit, systeem, genomen maatregel, wie geïnformeerd en datum", 4)],
  };

  return {
    title: "Register corrigerende maatregelen (Art. 20)",
    subtitle: companyName,
    intro: `Dit register legt de corrigerende maatregelen vast die ${companyName} als aanbieder heeft genomen bij (mogelijke) non-conformiteit van een hoog-risico AI-systeem (Art. 20 van de EU AI Act).`,
    sections: [
      registerSection,
      {
        heading: "Reikwijdte en verplichtingen",
        paragraphs: [PROVIDER_NOTE, RISK_NOTE],
      },
      {
        heading: "Wettelijke grondslag",
        paragraphs: [
          "Art. 20 van Verordening (EU) 2024/1689 (de AI Act): aanbieders nemen corrigerende maatregelen en informeren de betrokken partijen wanneer een hoog-risico systeem niet conform is; bij een risico (Art. 79 lid 1) informeren zij ook de markttoezichthouder (Art. 20 lid 2).",
          APPLIES_FROM_NOTE,
          "Dit is een bewerkbaar concept-register en geen juridisch advies.",
        ],
      },
    ],
  };
}
