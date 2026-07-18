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
 *
 * Design rule (audit Wave A/A.1): match on CONTEXT, not bare fragments. Common
 * Dutch business terms contain risk-word substrings (verkoopCIJFERs, dataMIGRATIE,
 * netwerkDIAGNOSe, KREDIETbeheer, TRIAGE van tickets), so every rule that keyed
 * off such a fragment now requires a second qualifying term (positive lookaheads)
 * to avoid false-positive high-risk calls — the worst failure mode for a
 * compliance product (CLAUDE.md rule #2).
 *
 * Canonical carve-out outcomes live in lib/compliance/carveouts.ts; the parity
 * test (classifier-parity.test.ts) enforces that this classifier and the
 * structured engine both agree with them, so the two can't drift.
 */
const RULES: { level: RiskLevel; patterns: RegExp; reason: string }[] = [
  // ── Unacceptable risk (Art. 5 — verboden praktijken) ──────────────────────
  {
    level: "unacceptable",
    patterns: /social.?scor|sociale scoring|sublimina/i,
    reason:
      "Mogelijk een verboden praktijk onder Artikel 5 (social scoring of subliminale technieken). Dit is alleen verboden onder specifieke voorwaarden — verifieer of de toepassing is toegestaan.",
  },
  // NB: kaal 'manipulatie' en 'gedragsbeïnvloeding' zijn bewust GEEN automatische
  // 'onaanvaardbaar': Art. 5(1)(a) vereist wezenlijke gedragsbeïnvloeding mét ernstige
  // schade, en gewone personalisatie/marketing valt daar niet onder.
  // ── Art. 5(1)(h) — real-time biometrische identificatie op afstand voor rechtshandhaving ──
  // Verboden ALLEEN in openbaar toegankelijke ruimten voor rechtshandhaving; vereist
  // daarom zowel een real-time biometrie-term ALS een rechtshandhavings-/openbare-ruimte-
  // context. Overige real-time biometrie valt door naar de hoog-risico biometrie-regel.
  {
    level: "unacceptable",
    patterns:
      /(?=[\s\S]*(real-?time|realtime|live))(?=[\s\S]*(biometr|gezichtsherken|gezichtsscan|gezichtsopname))(?=[\s\S]*(politie|rechtshandhaving|opsporing|law enforcement|openbare ruimte|openbaar toegankelijk|publieke ruimte))/i,
    reason:
      "Real-time biometrische identificatie op afstand in openbaar toegankelijke ruimten voor rechtshandhaving is in beginsel een verboden praktijk (Art. 5(1)(h)) — alleen toegestaan als strikt noodzakelijk en vooraf geautoriseerd voor limitatief opgesomde doelen. Verifieer de context.",
  },
  // ── Art. 5(1)(f) — emotion inference at WORK or in EDUCATION is prohibited ──
  // "...the use of AI systems to infer emotions of a natural person in the areas
  //  of workplace and education institutions, except where ... for medical or
  //  safety reasons" (Art. 5(1)(f)). Needs BOTH an emotion term AND a workplace/
  //  education context; checked before the general emotion-recognition rule below.
  {
    level: "unacceptable",
    patterns:
      /(?=[\s\S]*(emotieherken|emotie-?herken|emotiedetectie|emotion.?recogn|emoties?.{0,20}(herken|meten|afleid|detect|analys)))(?=[\s\S]*(werkvloer|werknemer|werkplek|personeel|medewerker|kantoor|onderwijs|school|scholier|student|leerling|klaslokaal|\bklas\b|examen|educat|workplace|employee))/i,
    reason:
      "Emotieherkenning op de werkvloer of in het onderwijs is een verboden praktijk (Art. 5(1)(f)), behalve om medische of veiligheidsredenen (nauwe uitzondering, met onderbouwing). Verifieer de context.",
  },
  // ── High risk (Annex III) ─────────────────────────────────────────────────
  {
    level: "high",
    patterns:
      /werving|sollicit|cv-?screen|recruit|kandidaat|personeels(selectie|beoordeling)|hr-?beslis/i,
    reason:
      "Werving & selectie en personeelsbeoordeling vallen onder Annex III, punt 4 (hoog risico).",
  },
  // ── Annex III 5(b)/(5c) — kredietwaardigheid + levens-/zorgverzekering ──
  // Kaal 'krediet' matchte kredietbeheer/leverancierskrediet (accounts-receivable),
  // en 'verzekering(spremie|srisico)' matchte auto/schade/reis — beide GEEN 5(b)/(5c).
  // (A) expliciete kredietwaardigheids-/scoringtermen + uitsluitend levens-/zorgverzekering:
  {
    level: "high",
    patterns:
      /kredietwaardig|creditscor|kredietscor|kredietacceptatie|leningsbeoordeling|hypotheekaanvraag|levensverzekering|zorgverzekering|ziektekostenverzekering|overlijdensrisicoverzekering|(life|health).?insurance/i,
    reason:
      "Kredietwaardigheidsbeoordeling of credit scoring van natuurlijke personen (Annex III, punt 5(b)) en risico-inschatting of prijsstelling voor levens- en zorgverzekeringen (punt 5(c)) vallen onder hoog risico. Detectie van financiële fraude is uitgezonderd (5(b)); schade-, auto- of reisverzekering valt hier niet onder.",
  },
  // (B) lening-/krediet-/hypotheekaanvraag mét een beoordelings-/beslissingscontext
  // (zo blijft zakelijk kredietbeheer/debiteurenbeheer buiten schot):
  {
    level: "high",
    patterns:
      /(?=[\s\S]*(\bkrediet|\blening|hypothe|leensom|consumptief krediet))(?=[\s\S]*(beoorde|goedkeur|afwijz|acceptat|aanvraag|toeken|scoren|scoort|risico-?inschat|\bkrijg|verstrek|toewijz))/i,
    reason:
      "Beoordeling van een lening-, krediet- of hypotheekaanvraag van natuurlijke personen valt onder Annex III, punt 5(b) (kredietwaardigheid) — hoog risico. Zakelijk kredietbeheer/debiteurenbeheer en fraudedetectie vallen hier niet onder.",
  },
  // ── Annex III 1(c) — emotion recognition OUTSIDE work/education is high-risk ──
  // "AI systems intended to be used for emotion recognition" (Annex III, point
  //  1(c)). The work/education case is prohibited (Art. 5(1)(f)) and caught above.
  {
    level: "high",
    patterns:
      /emotieherken|emotie-?herken|emotiedetectie|emotion.?recogn|emoties?.{0,20}(herken|meten|afleid|detect|analys)/i,
    reason:
      "Emotieherkenning valt onder Annex III, punt 1(c) (hoog risico). Let op: op de werkvloer of in het onderwijs is het een verboden praktijk (Art. 5(1)(f)).",
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
  // ── Annex III, punt 3 — onderwijs (instelling + doel-gebonden) ──
  // Hoog-risico alleen bij toelating/beoordeling/examentoezicht BINNEN een onderwijs-
  // of beroepsopleidingsinstelling. Vereist zowel een onderwijscontext ALS een
  // beoordelings-/toelatingsdoel, zodat 'verkoopcijfers', 'studentenhuisvesting' en
  // thuis-examentraining niet als hoog-risico onderwijs-AI worden aangemerkt.
  {
    level: "high",
    patterns:
      /(?=[\s\S]*(onderwijsinstelling|onderwijs|\bschool\b|scholen|schoolbestuur|universiteit|hogeschool|\bmbo\b|\bhbo\b|\bvmbo\b|\bhavo\b|\bvwo\b|opleiding|leerling|student|scholier|cursist|tentamen|examen))(?=[\s\S]*(toelating|toelaten|toegelaten|admissie|inschrijv|studiekeuze|schooladvies|beoorde|cijfer|becijfer|nakijk|toeken|leerresultaat|leeruitkomst|eindexamen|centraal examen|examentoezicht|proctor|toezicht|surveill|spieken))/i,
    reason:
      "Toelating tot of beoordeling binnen onderwijs- en beroepsopleidingsinstellingen valt onder Annex III, punt 3 (hoog risico). Consumenten-oefentools of studentendiensten buiten een instelling vallen hier niet onder.",
  },
  // ── Annex III, punt 2 — kritieke infrastructuur ──
  // Kaal 'verkeersmanagement' matchte interne magazijn-/heftrucklogistiek; punt 2
  // ziet op veiligheidscomponenten in kritieke (publieke) infrastructuur.
  {
    level: "high",
    patterns:
      /kritieke infrastructuur|energienet|elektriciteitsnet|gasnet|warmtenet|stadsverwarming|warmtevoorziening|drinkwatervoorziening|drinkwaterzuivering|waterzuivering|waterbedrijf|waterbeheer|wegverkeer|snelweg|verkeersleiding|verkeerscentrale|verkeerslicht|verkeersregeling/i,
    reason:
      "Beheer en werking van kritieke infrastructuur (digitale infrastructuur, wegverkeer, of levering van water, gas, warmte of elektriciteit) valt onder Annex III, punt 2 (hoog risico).",
  },
  // ── Annex I / Art. 6(1) — AI in een medisch hulpmiddel (specifieke termen) ──
  // Medische-hulpmiddel-AI is alleen hoog-risico MÉT externe (aangemelde-instantie)
  // conformiteitsbeoordeling voor CE-markering.
  {
    level: "high",
    patterns:
      /medisch hulpmiddel|medical device|zorgbeslis|klinische? beslis|patiënttriage|medische triage/i,
    reason:
      "AI in een medisch hulpmiddel valt onder Annex I / Art. 6(1): hoog risico geldt alleen mét een externe (aangemelde-instantie) conformiteitsbeoordeling voor CE-markering. Verifieer of dat van toepassing is.",
  },
  // ── Annex I / Art. 6(1) — diagnose/triage in een MEDISCHE context ──
  // Kaal 'diagnos'/'triage' matchte machine-/netwerkdiagnose en klantenservice-triage.
  // Vereist daarom een diagnose-/triageterm ÉN een medische/klinische context.
  {
    level: "high",
    patterns:
      /(?=[\s\S]*(diagnos|triage))(?=[\s\S]*(pati[eë]nt|ziekte|aandoening|radiolog|röntgen|\bmri\b|echografie|mammograf|ct-?scan|pet-?scan|patholog|huisarts|ziekenhuis|kliniek|klinisch|spoedeisende|\bseh\b|oncolog|cardiolog|dermatolog|zorgverlen|medische? beeld))/i,
    reason:
      "Diagnose- of triage-AI in een medische of klinische context valt onder Annex I / Art. 6(1): hoog risico geldt alleen mét een externe conformiteitsbeoordeling voor CE-markering. Verifieer of dat van toepassing is.",
  },
  // ── Annex III, punten 6-8 — rechtshandhaving, migratie/asiel, justitie ──
  // Kaal 'migratie'/'opsporing' matchte datamigratie/cloudmigratie en lek-/storings-
  // opsporing; deze punten zien op systemen die dóór of namens bevoegde autoriteiten
  // worden ingezet. Daarom persoons-/rechtshandhavingstermen i.p.v. losse fragmenten.
  {
    level: "high",
    patterns:
      /politie|rechtshandhaving|opsporingsonderzoek|strafrechtelijk|criminaliteitsbestrijding|justit|asiel|grenscontrole|grensbeheer|immigratie|vreemdelingen/i,
    reason:
      "Rechtshandhaving, migratie, asiel en justitie (Annex III, punten 6-8) vallen onder hoog risico.",
  },
  // ── Limited risk (Art. 50 — transparantieverplichting) ────────────────────
  {
    level: "limited",
    patterns:
      /chatbot|virtuele assistent|generatief|generative|llm|gpt|copilot|beeldgener|deepfake|content.?generat|tekstgener/i,
    reason:
      "Interactie- of generatieve AI valt onder de transparantieverplichting (Art. 50, beperkt risico).",
  },
  // ── Annex III, punt 5(b) uitzondering — detectie van financiële fraude ──
  // Punt 5(b) (kredietwaardigheid) kent een uitdrukkelijke uitzondering: "with the
  // exception of AI systems used for the purpose of detecting financial fraud".
  // Bewust ONDERAAN (ná alle hoog-risico- én Art. 50-regels): een chatbot/generatieve
  // AI die óók fraude detecteert wordt eerst als 'limited' herkend, en een opsporings-/
  // politiecontext als 'high'. Kale financiële-fraudedetectie is minimaal.
  {
    level: "minimal",
    patterns: /fraudedetectie|fraude-?detectie|fraud detection/i,
    reason:
      "Detectie van financiële fraude is uitdrukkelijk uitgezonderd van hoog risico (Annex III, punt 5(b)) — op zichzelf geen hoog-risico toepassing. Verifieer wel de context: bij inzet voor opsporing of rechtshandhaving kan een ander regime gelden.",
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
