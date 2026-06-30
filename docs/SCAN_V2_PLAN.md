# ComplAI — Scan v2 + Pricing/Positioning v2

> Multi-agent pass: competitor benchmark (aicompliancehub.nl) + code audit of our
> bugs + concrete design + legal/conversion fact-check. Fixes the 4 reported bugs
> and makes the scan a high-converting, *trustworthy* lead magnet. Everything
> carries "beslissingsondersteuning, geen juridisch advies, geen garantie".

## The 4 confirmed bugs (root causes, in code)

1. **Score always 0** — `buildProfile` scores `done/required`; a public scan
   passes empty evidence, and the new questions never ask "what have you already
   done?" → nothing is ever "done" → always 0.
2. **Almost everything → "Verboden praktijk"** — six Art. 5 options in the engine
   `return true` without context qualifiers; the wizard never asks the qualifier
   follow-ups → defensive ticks become false prohibitions.
3. **Lowest path still recommends "Starter"** — `recommendTier` maps `limited`
   tier to a paid plan; an advisory-only chatbot obligation pushes Starter.
4. **Progress bar jumps (9→12)** — total recomputes as branching reveals steps.

## A) Scan v2 — question set (friendly, ~15 + review)

Principles (adopted, original copy): one decision per screen; brands/verbs first,
Articles hidden until the report; anxiety-lowering helper text; Ja/Nee/Deels
shape; one guaranteed "win"; identity last; **editable review step**.

- **Sectie 0 — Organisatie:** company name (optional, soft opener) · size · sector (expand to ~20).
- **Sectie 1 — Tool-picker `[NEW]`:** "Welke AI-tools gebruikt u?" — named tools grouped (ChatGPT, Copilot, Gemini, Claude, Grok, Mistral, Meta, DeepSeek, Perplexity; image/audio; AI-in-business-software; branche-specifiek; geen/weet-niet/anders). A `mapTools()` helper **pre-fills** the legal fields (role, transparency, candidate Annex III) so most users barely touch the hard questions — but classification is always **confirmed**, never auto-set (avoids over-flagging). Plus "Waarvoor gebruikt u AI?" (plain verbs → silent Annex III mapping).
- **Sectie 2 — Rol:** "Ontwikkelt u zelf AI, of gebruikt u AI van anderen?" (simple) → provider/deployer/both; full role list behind "meer opties". Art. 25 modifications only if provider.
- **Sectie 3 — Risico (plain language):** "Neemt/ondersteunt uw AI beslissingen over mensen?" (Ja/Nee/Deels) → Annex III area picker (pre-checked, confirmed) → subarea (credit 5b/insurance 5c) → profiling → Art. 6(3) carve-out. Annex I product question only if a physical/medical/machine tool was picked.
- **Sectie 4 — Verboden praktijken (Bug 2 fix):** reframed header ("zeldzaam, de meeste vinken niets aan — goed nieuws"), **softened/narrowed labels**, and a **per-tick qualifier follow-up** (the missing wizard step) that de-escalates to "laten toetsen" instead of "Verboden — stop".
- **Sectie 5 — Transparantie (Art. 50):** pre-filled from tools; deepfake/public-text refinement question.
- **Sectie 6 — Readiness `[NEW]` (the score's real input):** Ja/Deels/Nee questions gated to only the obligations that apply — "Heeft u: training / AI-beleid / AI-register / menselijk toezicht / transparantiemeldingen / logging / risicobeoordeling / FRIA / technische documentatie?" Helper: "Eerlijk antwoorden geeft de beste score; dit zijn uw eigen opgaven (onbevestigd)."
- **Sectie 7 — Review (editable) → instant on-screen report → soft 3-way CTA** (download PDF anoniem / gratis account / mail rapport). Zero coercion.

## B) Scoring model (fixes Bug 1 & 3)

- **`evidenceFromAnswers(answers)` `[NEW]`** maps readiness tri-answers → the
  existing `CompanyEvidence` shape, so `resolveStatus()` works with no DB. ja →
  done, deels → in_progress (half credit), nee → open. Merge with DB evidence
  (DB wins) for logged-in users.
- **Score** over applicable *required* obligations with partial credit + a
  **baseline floor (35)** so it's never a demotivating 0, and a **minimal floor
  (≈70)**. Prohibited caps ≤20. Out-of-scope/excluded = 100 (drop the buggy
  `required.length===0` guard).
- **Engine fix (Bug 2):** gate the six ungated prohibited practices behind an
  affirmative qualifier; fix RBI default so an unqualified tick is a caveat, not
  a prohibition.
- **`recommendTier` rewrite (Bug 3):** recommend a paid tier **only** when a
  genuinely *required deliverable* exists (a required document; org-wide training
  for 11+). `limited`/advisory → **free**. ⚠️ **must exclude AI-literacy training
  from the paid trigger** (see corrections #4) or 11+ orgs get wrongly upsold.
- **Test matrix:** 9 representative paths → expected (score range, headline, key
  to-dos, plan) become a regression test `lib/compliance/__tests__/profile.test.ts`.

## C) Pricing v2

- Risk scan stays **free, no account** (lead magnet). **No free *plan* tier.**
  Paid plans = **gratis eerste maand, card required** (Stripe `trial_period_days:30`,
  auto-converts; pre-charge reminder email). Lower prices.
- Internal `TierId` ids stay (`gratis|starter|groei|schaal`); only **display
  names + prices** change. `gratis` = "geen abonnement nodig — gratis scan +
  stappenplan" (not a sellable plan).
- **Prices:** €29 / €69 / €149 per month (down from 39/89/199); annual = −2 months.
- **Plan-name options** (verdict: avoid "Compliant" — implies a guarantee):
  - **Option A (recommended):** *Inzicht (gratis) · Actief · Compliance-klaar · Audit-klaar*
  - **Option B:** *Scan (gratis) · Basis · Beheer · Aantoonbaar*
  - **Option C:** *Gratis Scan · Starter+ · Borging · Governance*

## D) Positioning / conversion copy (original Dutch)

- **Hero:** "Weet binnen 5 minuten **waar u staat** met de AI-wet." (NOT "of u
  naleeft" — that implies a verdict). Sub: Act in force since 2 feb 2025; free
  scan; deadlines + stappenplan; no account.
- **Urgency block** ("De wet wacht niet op u"): AI-literacy already mandatory;
  fines up to €35M/7% **bij ernstige overtredingen** (tie the €350k example to
  the 7% line); big duties from aug 2026 (Omnibus may defer — original date
  valid until adopted); "wie nu begint is op tijd". Footnote disclaimer.
- **Report framing:** gereedheidsscore + risicocategorie + rol + 3 urgente acties
  with article + date; "Waarom deze classificatie?" expander; **per-bar math**
  (which answer moved which bar — the thing the competitor doesn't show).
- **Trust strip:** "Gebouwd op Verordening (EU) 2024/1689 · Digital
  Omnibus-voorstel **gesignaleerd** (nog niet aangenomen) · in het Nederlands ·
  antwoorden in de EU."

## E) Build plan (each step shippable; bug fixes first)

1. ✅ **Engine correctness (Bug 2)** — gate prohibited practices + RBI default; soften labels. `engine.ts`, `questions.ts`.
2. ✅ **Scoring + recommender (Bug 1 & 3)** — `evidenceFromAnswers` + `mergeEvidence`; partial-credit score with baseline/minimal floor; `recommendTier` keyed on *required documents* (literacy excluded). 9-row regression test in `__tests__/profile.test.ts` (`npm run test`). `profile.ts`, `actions.ts`, `resolve.ts`, `types.ts`.
3. ✅ **Readiness questions** — `READINESS_QUESTIONS` (Ja/Deels/Nee), obligation-gated Sectie-6 steps. `questions.ts`, `wizard.ts`, `app/scan/page.tsx`.
4. ✅ **Progress-bar fix (Bug 4)** — `scanProgress()` is a pure function of the step's static section position → monotonic; dropped the "vraag X van Y" counter. `wizard.ts`, `app/scan/page.tsx`.
5. ✅ **Tool-picker + company name + use-cases** — grouped multi-select tool picker, optional company-name `text` step, plain-verb use-cases, `mapTools()` pre-fills role/scope/transparency/candidate-AnnexIII into still-empty fields (confirmed, never auto-set). `questions.ts`, `wizard.ts`, `app/scan/page.tsx`. *(Per-tick Art.5 qualifier sub-steps still deferred — engine already de-escalates unqualified ticks.)*
6. 🟡 **Results v2** — ✅ editable **review step** (`Controle` section: every answer, Aanpassen, edit-then-return). Still ⬜ per-obligation bars by date bucket, dual-date note, "waarom?" expander. `app/scan/page.tsx`, `results/[id]/page.tsx`.
7. ✅ **Pricing + Stripe** — names Inzicht/Actief/Compliance-klaar/Audit-klaar; €0/29/69/149; free-first-month (`trial_period_days:30`); annual = 2 mnd gratis. `lib/stripe.ts`, pricing-table, checkout route, marketing teaser.
8. ◻ **Marketing/positioning** — hero "waar u staat", urgency block, trust strip. (Pricing teaser done; hero/urgency/trust-strip pending.) `app/(marketing)/*`.

**Verified live (local, DB up):** anonymous scan → readiness section → instant report.
Limited-risk trained chatbot deployer = score **100 / Beperkt risico / plan Inzicht** (was
0 / often "Verboden" / "Starter"). `npm run test` green (28 checks); `tsc --noEmit` clean.
Corrections #1/#2/#4/#7/#12 folded in. **Not yet pushed to prod.**

## Fact-check corrections to fold in (must)

- **#4 (P0):** exclude `ART_4_LITERACY` (literacy) from the paid-tier trigger —
  it's satisfied by the free e-learning, not a paid plan. Otherwise every 11+ org
  using any AI gets wrongly upsold to "Actief". Gate the recommender on *documents* only.
- **#1 (P0):** if showing Omnibus dual-dates, Annex I needs its own (2027 legal /
  2028 proposed) — show all three deferrals or none.
- **#2 (P0):** trust strip "verwerkt" overclaims → use "gesignaleerd / nog niet
  aangenomen". Don't imply the Omnibus proposal is baked into the assessment.
- **#7 (P1):** hero "naleeft/compliant" → "waar u staat / hoe AI-gereed u bent".
- **#12 (P1):** don't name a plan "Compliant" (implies guarantee) → "Compliance-klaar"/"Borging".
- **#3 (P1):** minimal floor should floor the *baseline*, not the final score, so
  training "ja" beats "nee" (don't flatten every minimal user to exactly 70).
- **#6 (P1):** make the credit/insurance subarea capture **mandatory** when Annex
  III area 5 is picked, else FRIA silently under-fires for banks.
- **#8/#11 (P2):** tie the fine example to the 7% line; add an RBI-no-qualifier
  test row asserting caveat-not-prohibited; keep/clarify the "2–3% of firms" stat source.
