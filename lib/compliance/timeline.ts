// EU AI Act staggered application dates (Art. 113), as amended by the Digital
// Omnibus (Council final adoption 29 Jun 2026; OJ publication expected ~late Jul
// 2026). Used to stamp deadlines on obligations so the dashboard/governance can
// sort by what's due. Re-verify against the published OJ text once available.
//
// - 2 Feb 2025: prohibited practices (Art. 5) + AI literacy (Art. 4).
// - 2 Aug 2025: GPAI models (Chapter V), governance, penalties.
// - 2 Dec 2026: Art. 50 transparency marking for pre-existing systems + two new
//   Art. 5 prohibitions (non-consensual intimate imagery; CSAM).
// - 2 Dec 2027: Annex III high-risk obligations (deferred from 2 Aug 2026).
// - 2 Aug 2028: Annex I product high-risk obligations (deferred from 2 Aug 2027).

export const APPLICATION_DATES = {
  prohibitions: "2025-02-02", // Art. 5 (original prohibition regime)
  aiLiteracy: "2025-02-02", // Art. 4
  gpai: "2025-08-02", // Chapter V
  newProhibitions: "2026-12-02", // Art. 5 additions via Digital Omnibus (NCII, CSAM)
  transparency: "2026-12-02", // Art. 50 — Digital Omnibus (existing systems)
  highRiskAnnexIII: "2027-12-02", // Art. 6(2) / Annex III — Digital Omnibus (was 2 Aug 2026)
  highRiskAnnexI: "2028-08-02", // Art. 6(1) / Annex I — Digital Omnibus (was 2 Aug 2027)
} as const;

export type ApplicationDateKey = keyof typeof APPLICATION_DATES;
