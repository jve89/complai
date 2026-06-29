// EU AI Act staggered application dates (Art. 113). Used to stamp deadlines on
// obligations so the dashboard/governance can sort by what's due.
//
// - 2 Feb 2025: Chapter I (general) + Chapter II prohibited practices (Art. 5)
//   + AI literacy (Art. 4) apply.
// - 2 Aug 2025: GPAI models (Chapter V), governance, penalties.
// - 2 Aug 2026: the bulk of the Regulation — incl. Art. 50 transparency and
//   Annex III high-risk obligations.
// - 2 Aug 2027: high-risk systems that are products under Annex I (Art. 6(1)).

export const APPLICATION_DATES = {
  prohibitions: "2025-02-02", // Art. 5
  aiLiteracy: "2025-02-02", // Art. 4
  gpai: "2025-08-02", // Chapter V
  transparency: "2026-08-02", // Art. 50
  highRiskAnnexIII: "2026-08-02", // Art. 6(2) / Annex III
  highRiskAnnexI: "2027-08-02", // Art. 6(1) / Annex I
} as const;

export type ApplicationDateKey = keyof typeof APPLICATION_DATES;
