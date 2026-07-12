import type { RiskLevel } from "@prisma/client";

export interface ClassificationSuggestion {
  level: RiskLevel;
  reason: string;
}

/**
 * Heuristic risk classification based on the EU AI Act risk pyramid and the
 * Annex III high-risk use cases. This is a transparent keyword-based suggestion
 * to help users; it is NOT a legal determination and should be reviewed.
 *
 * Order matters: we check from most to least severe so the highest applicable
 * risk wins.
 */
const RULES: { level: RiskLevel; patterns: RegExp; reason: string }[] = [
  // ── Unacceptable risk (Art. 5 — verboden praktijken) ──────────────────────
  {
    level: "unacceptable",
    patterns:
      /social.?scor|sociale scoring|emotieherkenning|emotion recogn|manipulat|subliminaal|real-?time.*biometr|gedragsbe(ï|i)nvloed/i,
    reason:
      "Mogelijk een verboden praktijk onder Artikel 5 (bijv. social scoring of emotieherkenning). Verifieer of de toepassing is toegestaan.",
  },
  // ── High risk (Annex III) ─────────────────────────────────────────────────
  {
    level: "high",
    patterns:
      /werving|sollicit|cv-?screen|recruit|kandidaat|personeels(selectie|beoordeling)|hr-?beslis/i,
    reason:
      "Werving & selectie en personeelsbeoordeling vallen onder Annex III (hoog risico).",
  },
  {
    level: "high",
    patterns:
      /krediet|creditscor|kredietwaardig|leningsbeoordeling|verzekerings(premie|risico)/i,
    reason:
      "Krediet- en risicobeoordeling van personen valt onder Annex III (hoog risico).",
  },
  // ── Annex III 1(a) carve-out — 1:1 biometric VERIFICATION is NOT high-risk ──
  // "This shall not include AI systems intended to be used for biometric
  //  verification the sole purpose of which is to confirm that a specific natural
  //  person is the person he or she claims to be" (Annex III, point 1(a)).
  // Needs BOTH a biometric term AND a verification/authentication/login context;
  // checked before the biometric high-risk rule below.
  {
    level: "limited",
    patterns:
      /(?=[\s\S]*(biometr|gezicht|vingerafdruk|stem|iris))(?=[\s\S]*(verificat|authenticat|inloggen|\blogin\b|toegangscontrole|1-op-1|één-op-één|een-op-een))/i,
    reason:
      "Biometrische 1-op-1 verificatie (bevestigen dat iemand is wie hij zegt te zijn, bijv. vingerafdruk-login) is uitgezonderd van Annex III (punt 1(a)) — geen hoog risico. Controleer wel de transparantie- en privacyplichten.",
  },
  {
    level: "high",
    patterns: /biometr|gezichtsherkenning|vingerafdruk|stemherkenning/i,
    reason:
      "Biometrische identificatie op afstand (1-op-veel), categorisering of emotieherkenning valt onder Annex III (hoog risico). 1-op-1 verificatie (login) is uitgezonderd (punt 1(a)) — controleer welke van toepassing is.",
  },
  {
    level: "high",
    patterns: /onderwijs|examen|cijfer|toelating|student|leerling.?beoordel/i,
    reason:
      "Toegang tot en beoordeling binnen onderwijs valt onder Annex III (hoog risico).",
  },
  {
    level: "high",
    patterns:
      /medisch|diagnos|triage|patiënt|zorgbeslis|kritieke infrastructuur|energienet|waterbeheer/i,
    reason:
      "Toepassingen in zorg of kritieke infrastructuur kunnen onder Annex III vallen (hoog risico).",
  },
  {
    level: "high",
    patterns:
      /opsporing|politie|justit|migratie|asiel|grenscontrole|fraudedetectie/i,
    reason:
      "Rechtshandhaving, migratie en justitie vallen onder Annex III (hoog risico).",
  },
  // ── Limited risk (Art. 50 — transparantieverplichting) ────────────────────
  {
    level: "limited",
    patterns:
      /chatbot|virtuele assistent|generatief|generative|llm|gpt|copilot|beeldgener|deepfake|content.?generat|tekstgener/i,
    reason:
      "Interactie- of generatieve AI valt onder de transparantieverplichting (Art. 50, beperkt risico).",
  },
];

export function classifyAiSystem(input: {
  name?: string;
  description?: string;
  vendor?: string;
}): ClassificationSuggestion {
  const haystack = [input.name, input.description, input.vendor]
    .filter(Boolean)
    .join(" ");

  if (!haystack.trim()) {
    return {
      level: "limited",
      reason:
        "Niet genoeg informatie voor een suggestie. Vul een omschrijving in voor een betere inschatting.",
    };
  }

  for (const rule of RULES) {
    if (rule.patterns.test(haystack)) {
      return { level: rule.level, reason: rule.reason };
    }
  }

  return {
    level: "minimal",
    reason:
      "Geen kenmerken van hoog- of beperkt-risico gevonden. Waarschijnlijk minimaal risico — controleer dit zelf.",
  };
}
