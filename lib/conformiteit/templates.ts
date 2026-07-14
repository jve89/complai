// Builds the "Conformiteitsbeoordeling — statusoverzicht" evidence document (a
// DocumentContent) from the company's high-risk systems + their conformity
// assessments, rendered by the existing generic <DocumentPdf>. Provider-scoped;
// every step/route cites its article.

import type { DocSection, DocumentContent } from "@/lib/documents/templates";
import {
  CONFORMITY_STEPS,
  ROUTE_LABEL,
  STATUS_LABEL,
  stepStatus,
  conformityProgress,
  PROVIDER_NOTE,
  ROUTE_NOTE,
  REGISTRATION_NOTE,
  APPLIES_FROM_NOTE,
  type ConformityRoute,
  type StepsMap,
} from "@/lib/conformiteit/labels";

function field(label: string, lines = 3): NonNullable<DocSection["fields"]>[number] {
  return { label, lines };
}

export interface ConformitySystemRow {
  name: string;
  vendor: string | null;
  route: string;
  steps: StepsMap;
}

function routeLabel(route: string): string {
  return ROUTE_LABEL[route as ConformityRoute] ?? route;
}

export function buildConformityEvidence(
  companyName: string,
  rows: ConformitySystemRow[]
): DocumentContent {
  const sections: DocSection[] = [];

  // 1. Overview table across all high-risk systems.
  sections.push({
    heading: "1. Overzicht per hoog-risico systeem",
    paragraphs: rows.length
      ? ["Status van de conformiteitsbeoordeling per systeem waarvoor u aanbieder bent:"]
      : [
          "Er zijn geen hoog-risico systemen geregistreerd. De conformiteitsbeoordeling geldt zodra u een hoog-risico systeem als aanbieder op de markt brengt.",
        ],
    table: rows.length
      ? {
          headers: ["Systeem", "Route", "Voortgang"],
          rows: rows.map((r) => {
            const { done, total } = conformityProgress(r.steps);
            return [
              `${r.name}${r.vendor ? ` (${r.vendor})` : ""}`,
              routeLabel(r.route),
              `${done}/${total} stappen afgerond`,
            ];
          }),
        }
      : undefined,
    fields: rows.length ? undefined : [field("Systeem, route en status van de beoordeling", 3)],
  });

  // 2. Per-system step checklist.
  for (const r of rows) {
    sections.push({
      heading: `Stappen — ${r.name}`,
      paragraphs: [`Route: ${routeLabel(r.route)}.`],
      table: {
        headers: ["Stap", "Status"],
        rows: CONFORMITY_STEPS.map((s) => [s.label, STATUS_LABEL[stepStatus(r.steps, s.key)]]),
      },
    });
  }

  // 3. Route + scope notes.
  sections.push({
    heading: "Route en reikwijdte",
    paragraphs: [ROUTE_NOTE, REGISTRATION_NOTE],
  });

  // 4. Legal basis + caveats.
  sections.push({
    heading: "Wettelijke grondslag",
    paragraphs: [
      "Art. 43 (conformiteitsbeoordeling), Art. 47 (EU-conformiteitsverklaring), Art. 48 (CE-markering) en Art. 49 (registratie in de EU-databank) van Verordening (EU) 2024/1689 (de AI Act).",
      PROVIDER_NOTE,
      APPLIES_FROM_NOTE,
      "Dit is een bewerkbaar concept-statusoverzicht en geen juridisch advies.",
    ],
  });

  return {
    title: "Conformiteitsbeoordeling — statusoverzicht (Art. 43)",
    subtitle: companyName,
    intro: `Dit overzicht volgt, per hoog-risico AI-systeem waarvoor ${companyName} aanbieder is, de stappen naar een conforme, CE-gemarkeerde inzet (Art. 43 en volgende van de EU AI Act).`,
    sections,
  };
}
