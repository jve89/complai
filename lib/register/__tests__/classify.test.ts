// Regression matrix for the AI-register keyword classifier (lib/register/classify.ts).
// Pure function, no DB — runs standalone:  npx tsx lib/register/__tests__/classify.test.ts
//
// Guards the audit Wave-A / A.1 fixes (register false positives), each grounded in
// the verbatim Regulation (EU) 2024/1689:
//   #3  financial-fraud detection is NOT high-risk (Annex III 5(b) exception);
//   #6  bare 'manipulatie'/'real-time biometrie'/'gedragsbeïnvloeding' are NOT
//       automatically 'onaanvaardbaar' (Art. 5 qualifiers required), EXCEPT the
//       narrow Art. 5(1)(h) real-time-RBI-for-law-enforcement case;
//   #11 medical-device AI is Annex I / Art. 6(1) (not Annex III), and only
//       life/health insurance is high-risk (Annex III 5(c));
//   A.1 the classifier no longer matches bare substrings of common Dutch business
//       terms (verkoopCIJFERs, dataMIGRATIE, netwerkDIAGNOSe, KREDIETbeheer,
//       TRIAGE van tickets, verkeersmanagement in een magazijn).

import { classifyAiSystem } from "@/lib/register/classify";

let failures = 0;
function expectLevel(desc: string, expected: string, note = "") {
  const got = classifyAiSystem({ description: desc }).level;
  const ok = got === expected;
  const tag = ok ? "PASS" : "FAIL";
  console.log(`  [${tag}] "${desc}" → ${got}${ok ? "" : ` (expected ${expected})`}${note ? `  — ${note}` : ""}`);
  if (!ok) failures++;
}

console.log("#3 — financial-fraud detection carve-out (Annex III 5(b)):");
expectLevel("AI voor fraudedetectie bij pinbetalingen", "minimal", "financial fraud detection is excluded");
expectLevel("fraude-detectie in onze webshop-checkout", "minimal");
expectLevel("fraud detection engine for transactions", "minimal");
expectLevel("fraudedetectie ingezet door de politie voor opsporing", "high", "LE context still wins");
expectLevel("kredietscoring met een fraudedetectie-module", "high", "explicit credit signal → high");
expectLevel("Klantenservice-chatbot met fraudedetectie voor onze webshop", "limited", "A.1: Art. 50 chatbot wins over fraud→minimal");

console.log("\n#6 — bare Art. 5 keywords are no longer auto-'onaanvaardbaar':");
expectLevel("tool voor manipulatie van productafbeeldingen", "minimal", "image manipulation ≠ prohibited");
expectLevel("gedragsbeïnvloeding via gepersonaliseerde marketing", "minimal", "ordinary marketing");
expectLevel("real-time biometrische identificatie in het stadion", "high", "private → high biometrics, not prohibited");
expectLevel("real-time gezichtsherkenning in de openbare ruimte voor de politie", "unacceptable", "A.1: Art. 5(1)(h) restored");
expectLevel("social scoring van burgers", "unacceptable");
expectLevel("subliminale beïnvloedingstechnieken", "unacceptable");

console.log("\n#11 — medical (Annex I) and insurance (Annex III 5(c)) precision:");
expectLevel("diagnostische AI voor radiologiebeelden", "high", "clinical → Annex I / Art. 6(1)");
expectLevel("triage-ondersteuning op de spoedeisende hulp", "high");
expectLevel("medisch hulpmiddel met AI-beeldanalyse", "high");
expectLevel("AI voor patiëntdiagnose in het ziekenhuis", "high");
expectLevel("medische afsprakenplanning voor de huisartsenpraktijk", "minimal", "benign admin, not over-called");
expectLevel("patiëntportaal met een informatieve chatbot", "limited", "chatbot → Art. 50, not high");
expectLevel("risico-inschatting voor een levensverzekering", "high", "life insurance → 5(c)");
expectLevel("acceptatie van een zorgverzekering", "high", "health insurance → 5(c)");
expectLevel("premieberekening voor een autoverzekering", "minimal", "car insurance NOT high-risk");
expectLevel("premie voor een reisverzekering", "minimal", "travel insurance NOT high-risk");

console.log("\nA.1 — substring over-calls eliminated (all were 'high' before):");
expectLevel("AI-dashboard voor het analyseren van verkoopcijfers en omzet", "minimal", "'cijfer' no longer → education");
expectLevel("BI-tool voor omzetcijfers en groeicijfers", "minimal");
expectLevel("AI voor triage van inkomende klantenservice-tickets", "minimal", "'triage' needs medical context");
expectLevel("AI-diagnosetool voor storingen in productiemachines", "minimal", "'diagnos' needs medical context");
expectLevel("voertuigdiagnose en netwerkdiagnose assistent", "minimal");
expectLevel("AI-assistent voor datamigratie naar de cloud", "minimal", "'migratie' no longer → asylum");
expectLevel("hulp bij cloudmigratie van bedrijfssoftware", "minimal");
expectLevel("AI-tool voor kredietbeheer en debiteurenopvolging", "minimal", "'krediet' needs creditworthiness context");
expectLevel("leverancierskrediet en kredietlimietbewaking", "minimal");
expectLevel("AI voor examentraining en oefentoetsen voor scholieren thuis", "minimal", "consumer tutoring, no institution+purpose");
expectLevel("AI-platform voor het vinden van studentenhuisvesting", "minimal", "'student' without assessment purpose");
expectLevel("AI voor lekopsporing in waterleidingen bij woningen", "minimal", "'opsporing' no longer → law enforcement");
expectLevel("AI voor verkeersmanagement in ons magazijn (heftrucks)", "minimal", "private logistics ≠ critical infra");

console.log("\nA.2 — narrowing no longer under-calls genuine high-risk (were dropped to minimal):");
expectLevel("AI-systeem dat het schooladvies voor groep 8 leerlingen bepaalt", "high", "Annex III 3(a)/(c)");
expectLevel("AI voor automatisch nakijken van tentamens op de universiteit", "high", "Annex III 3(b)");
expectLevel("AI die toezicht houdt op leerlingen tijdens digitale toetsen om spieken te detecteren", "high", "Annex III 3(d) proctoring");
expectLevel("AI die beslist welke leerlingen worden toegelaten tot onze school", "high", "Annex III 3(a) admission");
expectLevel("AI die studenten beoordeelt op hun opleiding", "high", "'beoordeelt' conjugation now matched");
expectLevel("AI beoordeelt automatisch of een klant een persoonlijke lening krijgt", "high", "Annex III 5(b) consumer lending");
expectLevel("AI-model dat leningaanvragen van consumenten goedkeurt of afwijst", "high", "Annex III 5(b)");
expectLevel("AI beoordeelt of een particulier een hypotheek kan krijgen", "high", "Annex III 5(b)");
expectLevel("AI die op röntgenfoto's longafwijkingen diagnosticeert", "high", "radiology → Annex I / Art. 6(1)");
expectLevel("AI voor premieberekening van een overlijdensrisicoverzekering", "high", "term life → 5(c)");
expectLevel("AI als veiligheidscomponent in het warmtenet van de stadsverwarming", "high", "Annex III 2 heating");
expectLevel("AI voor verkeersmanagement op de snelwegen rond Amsterdam", "high", "Annex III 2 road traffic");
expectLevel("AI die verkeerslichten aanstuurt op kruispunten in de stad", "high", "Annex III 2 road traffic");

console.log("\nA.2 — the broadening did NOT re-introduce the A.1 over-calls (still minimal):");
expectLevel("AI-tool voor kredietbeheer en debiteurenopvolging", "minimal", "business credit control, no decision context");
expectLevel("leverancierskrediet en kredietlimietbewaking", "minimal");
expectLevel("AI voor examentraining en oefentoetsen voor scholieren thuis", "minimal", "consumer tutoring, no purpose term");
expectLevel("AI voor studieadvies aan scholieren", "minimal", "generic study advice, borderline → left minimal");
expectLevel("AI voor verkeersmanagement in ons magazijn (heftrucks)", "minimal", "private logistics ≠ road traffic");
expectLevel("voertuigdiagnose en netwerkdiagnose assistent", "minimal", "no clinical context");
expectLevel("AI voor lekopsporing in waterleidingen bij woningen", "minimal", "plumbing, not water infra/LE");

console.log("\n— unchanged / genuinely high-risk behaviour (guard against regressions) —");
expectLevel("CV-screening en werving van kandidaten", "high", "Annex III 4");
expectLevel("kredietwaardigheidsbeoordeling van klanten", "high", "Annex III 5(b)");
expectLevel("creditscore berekenen voor leningaanvragen", "high");
expectLevel("emotieherkenning bij werknemers op de werkvloer", "unacceptable", "Art. 5(1)(f)");
expectLevel("emotieherkenning in een marketingpanel", "high", "Annex III 1(c)");
expectLevel("vingerafdruk-login voor toegangscontrole", "limited", "1:1 verification carve-out");
expectLevel("gezichtsherkenning op afstand in de winkel", "high");
expectLevel("AI voor cijferbeoordeling van leerlingen op school", "high", "education institution + purpose → Annex III 3");
expectLevel("toelatingssysteem voor de universiteit", "high");
expectLevel("beheer van het energienet en wegverkeer", "high", "Annex III 2");
expectLevel("AI-ondersteuning voor de politie bij opsporingsonderzoek", "high", "Annex III 6");
expectLevel("ondersteuning bij de asielprocedure", "high", "Annex III 7");
expectLevel("een AI-chatbot voor klantvragen", "limited", "Art. 50");
expectLevel("interne notulen-samenvatter", "minimal", "no risk signals");

console.log("");
if (failures === 0) {
  console.log("✓ All register-classifier regression checks passed.");
} else {
  console.log(`✗ ${failures} check(s) failed.`);
  process.exit(1);
}
