# Bevindingen klantreis-controle — 23 augustus 2026

Uitgevoerd op productie (commit c852e83), anoniem getest via de vercel.app-URL.
Testsuite gedraaid: 15/15 bestanden, 331 assertions, 0 fouten.

## De scorelogica en het gevolg ervoor

profile.ts: score = baseline + (100 - baseline) * raw, baseline = 70 bij
headline "minimal". Voor een laag-risico gebruiksverantwoordelijke is
required.length === 1 (alleen ART_4_LITERACY). Er zijn dus maar drie mogelijke
scores: 70, 85, 100.

Twee runs met hetzelfde profiel (zakelijke dienstverlening, 11-50, Copilot voor
teksten, deployer, geen Annex III):
- alles op orde  -> 100, "Minimaal risico"
- niets geregeld -> 70,  "Minimaal risico"

De readiness-antwoorden over AI-beleid en AI-register bewegen de score niet: ze
zijn voor dit pad geen required obligation. Een prospect die toegeeft dat hij
niets heeft, ziet dat verdwijnen uit de uitkomst.

Dit is geen bug maar een ontwerpgevolg. Het botst wel met de belofte op de
homepage ("U gebruikt al AI. Alleen kunt u dat niet aantonen") en met de eigen
regel in de correctness-spec: "The correct answer always has a deliverable
attached."

## Openstaande punten, in volgorde

1. ART_6_4_ASSESSMENT (Art. 6(4) / 49(2)) bestaat met documentsjabloon en
   upsell-tekst, maar vuurt alleen op de high_notify-tak, dus alleen wanneer
   iemand expliciet art6_3_carveout claimt. De minimal-tak heeft geen enkele
   deliverable. Dit is de belangrijkste openstaande productvraag.
2. Testgaten t.o.v. docs/regulatory/ai-act-correctness-spec.md: Art. 49(2)
   registratieplicht (0 tests), Art. 2(6) onderzoeksuitzondering (0 tests),
   spec-testgeval 1 (bakkerij + ChatGPT) niet als benoemde test. De 8
   spec-testgevallen zouden 8 benoemde tests moeten zijn.
3. answers.sector wordt door engine.ts, profile.ts en relevance.ts nergens
   gelezen. Tien opties, derde vraag in de wizard, geen effect op de uitkomst.
   Weghalen of een functie geven.
4. scanProgress() (wizard.ts 311-325) rekent met statische sectiepositie. Voor
   een 15-staps pad springt de balk van 15% naar 30% tussen stap 5 en 6 en
   kruipt hij 83/84/85 bij de laatste drie. Bij "Aanpassen" vanaf het overzicht
   valt hij terug naar 2%. Bewust nog niet gefixt: verandert mee zodra de
   vragenset verandert.

## Onderzocht en NIET waar (niet opnieuw uitzoeken)

- "Volgende reageert pas op de tweede klik" - artefact van geautomatiseerd
  klikken dat de re-render voorbijrende. Een echte klik werkt de eerste keer.
- "Eerste optie voorgeselecteerd" en "AIF OU staat in het naamveld" - dat is de
  bedoelde prefill uit het bedrijfsprofiel voor ingelogde gebruikers
  (app/scan/page.tsx). Anoniem is het formulier leeg.
- "20 tabellen met RLS aan en geen policies" - correct zo; alles loopt
  server-side via Prisma, RLS deny-all is de juiste stand.
- 503-responses in het netwerkpaneel - Vercels eigen edge-probe, niet de app.

## Losstaand, buiten de scan

- Homepage: 49 [data-reveal]-blokken (78% van de tekst) op opacity:0 tot de
  IntersectionObserver afgaat, zonder fallback. home.css 341-346,
  home-effects.tsx 61-74.
- Supabase Auth: leaked password protection staat uit.
- /api/pdf/incident/[id] en /api/pdf/notice/[id] hebben geen tiercontrole in de
  route terwijl hun pagina's op Compliance gated zijn.
