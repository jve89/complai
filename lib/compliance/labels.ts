// Dutch display labels per document slug, shared by the profile engine and the
// documents UI so a slug that has no generator template yet still gets a proper
// human title.

export const DOC_LABELS: Record<string, string> = {
  ai_policy: "AI-beleid",
  transparency: "Transparantieverklaring",
  fria: "FRIA (grondrechtentoets)",
  risk_assessment: "Risicobeoordeling",
  tech_doc: "Technische documentatie (Annex IV)",
  doc_conformity: "EU-conformiteitsverklaring",
  assessment_record: "Beoordelingsdossier (Art. 6(4))",
  gpai_docs: "GPAI-documentatie",
  audit_report: "AI Act Readiness Audit",
};

export const docLabel = (slug: string): string => DOC_LABELS[slug] ?? slug;

/** Plain-text labels for the profile headline (used in UI badges and emails). */
export const HEADLINE_LABEL: Record<string, string> = {
  prohibited: "Verboden praktijk",
  high_risk: "Hoog risico",
  limited_risk: "Beperkt risico",
  out_of_scope: "Buiten de reikwijdte",
  excluded: "Uitgesloten",
  minimal: "Minimaal risico",
};

export const headlineLabel = (headline: string): string =>
  HEADLINE_LABEL[headline] ?? headline;
