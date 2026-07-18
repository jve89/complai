// SINGLE SOURCE OF TRUTH for the Annex III / Art. 5 carve-outs that BOTH
// classifiers must honour:
//   - the structured scan engine (lib/compliance/engine.ts), keyed on Annex III
//     area codes + qualifier fields, and
//   - the free-text register classifier (lib/register/classify.ts), keyed on regex.
// The two use different mechanisms, so they can't share the matching LOGIC — but
// they must reach the SAME risk outcome on each canonical case. This registry
// records that outcome once (with the governing article and how each case is
// expressed to each classifier); the parity test
// (lib/compliance/__tests__/classifier-parity.test.ts) enumerates it and asserts
// both classifiers agree, so a re-verified legal rule fixed in one can't silently
// drift from the other.
import type { ScanAnswers } from "@/lib/compliance/questions";

export type CarveoutOutcome = "prohibited" | "high" | "not_high";

export interface Carveout {
  id: string;
  label: string;
  /** Governing article/annex point. */
  article: string;
  /** The agreed risk outcome both classifiers must reach. */
  outcome: CarveoutOutcome;
  /** How the case is expressed to the structured scan engine (buildProfile). */
  structured: Partial<ScanAnswers>;
  /** A representative free-text description for the register classifier. */
  sample: string;
}

export const CARVEOUTS: Carveout[] = [
  {
    id: "biometric_verification",
    label: "Biometrische 1-op-1 verificatie (login)",
    article: "Annex III 1(a) carve-out",
    outcome: "not_high",
    structured: { annexIII_areas: ["1"], biometricUse: "verification" },
    sample: "vingerafdruk-login voor toegangscontrole",
  },
  {
    id: "biometric_identification",
    label: "Biometrische 1-op-veel identificatie op afstand",
    article: "Annex III 1",
    outcome: "high",
    structured: { annexIII_areas: ["1"], biometricUse: "identification" },
    sample: "gezichtsherkenning op afstand in de winkel",
  },
  {
    id: "credit_scoring",
    label: "Kredietwaardigheidsbeoordeling van natuurlijke personen",
    article: "Annex III 5(b)",
    outcome: "high",
    structured: { annexIII_areas: ["5"], annexIII_subareas: ["5b"] },
    sample: "kredietwaardigheidsbeoordeling van klanten",
  },
  {
    id: "hr_recruitment",
    label: "Werving & selectie / personeelsbeoordeling",
    article: "Annex III 4",
    outcome: "high",
    structured: { annexIII_areas: ["4"] },
    sample: "CV-screening en werving van kandidaten",
  },
  {
    id: "emotion_at_work",
    label: "Emotieherkenning op de werkvloer of in het onderwijs",
    article: "Art. 5(1)(f)",
    outcome: "prohibited",
    structured: { prohibited: ["emotion_work_edu"] },
    sample: "emotieherkenning bij werknemers op de werkvloer",
  },
];
