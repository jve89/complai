// EU AI Act staggered application dates (Art. 113), as amended by the Digital
// Omnibus (Parliament 16 Jun 2026, Council 29 Jun 2026; OJ publication expected
// ~late Jul 2026). Used to stamp deadlines on obligations so the dashboard/
// governance can sort by what's due. Re-verify against the published OJ text.
//
// Each entry carries its provenance:
//  - status `in_force`            — published & applicable under the OJ text.
//  - status `pending_publication` — comes from the Digital Omnibus, which is
//    adopted but NOT yet published in the Official Journal. Until it publishes,
//    the ORIGINAL Art. 113 date formally applies (Annex III: 2 Aug 2026;
//    Annex I: 2 Aug 2027; Art. 50 transparency: 2 Aug 2026).
//  - basis  `art113` | `digital_omnibus` — the legal source of the date.
//
// Dates (do not change without a primary-source check):
// - 2 Feb 2025: prohibited practices (Art. 5) + AI literacy (Art. 4).
// - 2 Aug 2025: GPAI models (Chapter V), governance, penalties.
// - 2 Dec 2026: Art. 50 transparency for pre-existing systems + two new Art. 5
//   prohibitions (non-consensual intimate imagery; CSAM) — Digital Omnibus.
// - 2 Dec 2027: Annex III high-risk obligations — Digital Omnibus (was 2 Aug 2026).
// - 2 Aug 2028: Annex I product high-risk obligations — Digital Omnibus (was 2 Aug 2027).

export type DateStatus = "in_force" | "pending_publication";
export type DateBasis = "art113" | "digital_omnibus";

export interface ApplicationDate {
  /** ISO YYYY-MM-DD — the applicable date. */
  date: string;
  /** Whether the date is in force under the published OJ text, or still pending
   *  the Digital Omnibus's OJ publication (until then the original Art. 113 date
   *  formally applies). */
  status: DateStatus;
  /** Legal source of the date. */
  basis: DateBasis;
}

export const APPLICATION_DATES = {
  prohibitions: { date: "2025-02-02", status: "in_force", basis: "art113" }, // Art. 5 (original prohibition regime)
  aiLiteracy: { date: "2025-02-02", status: "in_force", basis: "art113" }, // Art. 4
  gpai: { date: "2025-08-02", status: "in_force", basis: "art113" }, // Chapter V
  newProhibitions: { date: "2026-12-02", status: "pending_publication", basis: "digital_omnibus" }, // Art. 5 additions (NCII, CSAM)
  transparency: { date: "2026-12-02", status: "pending_publication", basis: "digital_omnibus" }, // Art. 50 existing systems (Art. 113 original: 2 Aug 2026)
  highRiskAnnexIII: { date: "2027-12-02", status: "pending_publication", basis: "digital_omnibus" }, // Art. 6(2) / Annex III (Art. 113 original: 2 Aug 2026)
  highRiskAnnexI: { date: "2028-08-02", status: "pending_publication", basis: "digital_omnibus" }, // Art. 6(1) / Annex I (Art. 113 original: 2 Aug 2027)
} as const satisfies Record<string, ApplicationDate>;

export type ApplicationDateKey = keyof typeof APPLICATION_DATES;
