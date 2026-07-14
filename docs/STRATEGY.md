# ComplAI — Long-term plan & guardrails

> A living plan. Update it as reality teaches us, but change the **guardrails**
> only deliberately — they exist to keep us honest when we're tempted not to be.

## North star

**1,000 monthly-paying Dutch businesses who stay** — not because they're locked
in, but because ComplAI genuinely helps them steer the EU AI Act and keeps them
current as it changes.

"Won" = 1,000 retained paying businesses **with healthy net revenue retention**
(they renew, expand, and refer). Signups are not the goal; *retained, genuinely-
helped* businesses are.

## Honest baseline (2026-07)

- **Built & solid:** auth, live Stripe billing, enforced tiers, legal entity
  (AIF OÜ), SEO, and a genuinely deep **e-learning** (12 modules, verified,
  Omnibus-current, certificates). The hard technical half is done.
- **Strongest "pay today" asset:** AI literacy (Art. 4) — a legal duty *already
  in force* for every org using AI. This is the wedge.
- **Real gaps (mostly go-to-market, not features):**
  1. **Retention mechanic** — "we keep you current" is real value but invisible;
     it happened for the Digital Omnibus only because we asked. It must become a
     visible feature, or customers download-and-cancel.
  2. **Trust** — unknown brand (Estonian entity) selling compliance; customers
     can't see that our content is verified and current.
  3. **Distribution** — barely exists beyond nascent SEO. This is the real
     1,000-customer lever.
  4. **Documents** — honest but thin; weak perceived value.

## Stages (advance on outcomes, not dates)

Each stage has a **gate**. Do not advance until the gate is met — scaling on a
broken funnel just burns money and trust.

### Stage 0 — Trustworthy & current (foundation)
Make the product genuinely trustworthy and self-evidently current *before*
pushing growth.
- Make **"keep you current" a visible feature**: change alerts, "your training/
  docs were updated because the law changed on X," re-certification prompts,
  deadline reminders. (The Omnibus is the first case study.)
- Add **trust signals**: a "how we keep this accurate" transparency page, a named
  legal/AI reviewer, first testimonials.
- **Deepen the documents** so they read as bespoke (heavily pre-filled from the
  scan + register), or reposition them as supporting output — not the headline.
- Close the open accuracy item (verify Omnibus dates vs the published OJ).
- **Gate:** a customer can *see* "the law changed → we updated you"; docs feel
  bespoke; basic trust signals are live.

**Status (8 Jul 2026) — gate MET on the product side:**
- ✅ "Keep you current" fully wired **and activated**: updates feed + dashboard
  card (A+B), re-cert prompt + "new updates" nav badge (D), and the email-on-change
  cron (C) is **live** — `CRON_SECRET` set, Resend domain `complai-eu.nl` verified,
  and real digest delivery to an inbox verified end-to-end. The plan's #1 gap
  (retention mechanic) is closed.
- ✅ Trust page live at `/kwaliteit`. Open (founders): a named legal/AI reviewer
  + 1–2 real testimonials (placeholder marked in code, do NOT fabricate).
- ✅ Documents deepened across all 8 types (bespoke via `docContext`).
- ✅ **Pre-launch audit + 3 fix waves shipped** (production-hardening, a Stage-0→1
  bridge): closed a real security leak (RLS off on prod tables), billing/webhook/
  scan-consistency bugs, invite robustness, SEO, and stripped over-promising copy
  (reinforcing Guardrail 1). Prod DB baselined onto migrations.
- ◻ Open: re-verify Omnibus dates vs the published OJ (~late Jul); the two founder
  trust items above.

**So: Stage 0's product gate is met.** The remaining Stage-0 items need real-world
inputs (a reviewer, testimonials, the OJ text), not code.

**Reality check on the map:** we're build-ahead, distribution-behind. Of the four
baseline gaps, retention/trust/documents are addressed; **distribution (gap #3, the
"real 1,000-customer lever") is still untouched.** Per Guardrail 5 it must advance —
it's the actual path to 1,000, and mostly go-to-market (friend-owned), not build.

**Current build focus (into Stage 1):** instrument the metrics that matter (below)
so we can *read* Stage 1's gate — activation (scan → literacy certificate) and
retention — from our own data, and lead the funnel with the AI-literacy wedge.

### Stage 1 — First ~50 paying, retained (validate)
Prove willingness-to-pay and retention with one wedge and one channel.
- Lead the funnel with **AI literacy** as the "you legally need this now" hook:
  free scan → free literacy taster → paid.
- Land **one distribution partnership** (accountant network, payroll/HR provider,
  branchevereniging, or consultant who advises SMEs).
- Instrument and read **retention** (who stays past month 1–3, and why). Talk to
  every early customer.
- **Gate:** ~50 paying, positive month-3 retention signal, a clear pattern of
  who buys and why.

### Stage 2 — Repeatable acquisition (make it a machine)
Turn what worked in Stage 1 into a predictable engine.
- Double down on the winning channel + wedge; add a **content/SEO engine**
  (kennisbank as marketing) and a fast onboarding to first value (scan →
  literacy → certificate).
- Expand to 2–3 distribution channels.
- **Gate:** predictable CAC < LTV, ~200–300 paying, low churn.

### Stage 3 — Scale to 1,000 & moat (stick and grow)
- Deepen the "keep you current" moat: proactive change tracking, re-certification
  cadence, audit-readiness reports, team/admin value.
- **Gate:** 1,000 paying with healthy net revenue retention.

## Guardrails (we stick to these)

1. **Honesty over hype.** Never claim "you are compliant." It is decision support
   + AI literacy, always current, never legal advice. Trust is the whole product.
2. **Accuracy is non-negotiable.** Legal facts/dates change only against a
   **primary source** (OJ / Commission), never third-party summaries alone.
   Content is adversarially verified. When the law moves, we move first and tell
   customers. (This *is* both the retention engine and the trust story.)
3. **Every paid feature earns its keep monthly.** For anything we ship, ask:
   "does this give a reason to still be here *next* month?" Guard against
   download-and-cancel.
4. **Substance over filler; depth over breadth.** No thin content or bare
   features to look bigger. Fewer things, genuinely well done.
5. **Distribution is a first-class problem.** Every stage must advance at least
   one distribution channel. "Good product = customers" is a lie we won't tell
   ourselves.
6. **Focus until 1,000: Dutch SME × EU AI Act.** Resist premature expansion
   (other countries, other regulations, enterprise) until the core loop is proven.
7. **Measure retention, not vanity.** The reported number is *retained paying
   businesses*, not signups.
8. **Price for felt value; keep tiers simple.** The price must map to value the
   customer can feel.
9. **Advance on gates, not dates.** A stage isn't "done" on a deadline; it's done
   when its gate is met.

## Metrics that matter (in priority order)

1. Retained paying businesses (month-3 and month-12 retention / NRR).
2. Activation: % of signups reaching first value (scan → literacy certificate).
3. Paid conversion from the free scan/literacy funnel.
4. CAC by channel vs. LTV.
5. Regulatory-currency SLA: time from a legal change to updated content + a
   customer-visible notice. (Our differentiator — hold it tight.)

## Review cadence

Revisit this doc at every **stage gate**, and lightly each month against the
metrics above. Change the plan freely; change the **guardrails** only on purpose.

## Compliance-completeness roadmap (operational duties for high-risk)

The five pillars (register · documents · e-learning · knowledge bank · updates)
cover "get compliant." Below are the ONGOING operational duties that bind
**high-risk deployers and providers** once Annex III applies (**2 Dec 2027**,
Digital Omnibus). A limited/minimal-risk SME (the majority) needs none of this —
so we **build ahead of the rollout** and **gate by who owes the duty**, never
make a legally-required tool Audit-only.

**Gating principle** (extends `DOC_MIN_TIER` in `lib/plan.ts`): duties of a
**deployer** of high-risk AI → **Compliance (groei)**; duties of a
**provider/maker** → **Audit (schaal)**. The scan already recommends the lowest
pakket that unlocks a customer's required items — these must keep that promise
(so: *not* Audit-only).

### Wave 1 — high-risk deployer essentials (Compliance tier)
- [x] **Incident register + serious-incident reporting** — Art 73, Art 26(5).
      Log incidents, generate the authority report, surface the 2 / 10 / 15-day
      deadlines. New `Incident` model. *(Shipped: `/dashboard/meldingen`.)*
- [x] **Human-oversight register** — Art 26(2), Art 14. Per high-risk system: a
      named, competent overseer linked to their AI-literacy certificate (extends
      the AI-register). *(Shipped: `AiSystem.oversightEmployeeId` + the register's
      "Menselijk toezicht" column.)*
- [x] **Notification & explanation templates** — Art 26(7) (workers), Art 26(11)
      (affected individuals), Art 86 (right to explanation). *(Shipped as the
      `/dashboard/kennisgevingen` module: a `Notice` register — the record that
      notices were issued — plus a per-record fill-in notice/explanation PDF built
      from `DocumentContent` and rendered by the existing `DocumentPdf`, rather
      than generic slugs in the Documenten grid, since these notices are inherently
      per-recipient/per-date. Gated at Compliance; framed as prepare-ahead — the
      duties apply from 2 Dec 2027.)*

### Wave 2 — high-risk deployer completeness (Compliance tier)
- [x] **Log-retention record** — Art 26(6) (≥ 6 months). Per system: location,
      retention, owner. (We can't hold the logs; we evidence the policy.)
      *(Shipped: `/dashboard/logbewaring` — 4 fields on `AiSystem`, a groei-gated
      worklist over high-risk systems with a documented/under-min/missing status,
      and a "Logbewaringsbeleid (Art. 26 lid 6)" evidence PDF. Surfaces the "voor
      zover onder uw controle" limit so it never asserts a blanket duty.)*
- [x] **Complaint procedure + register** — Art 27(1)(f), Art 85.
      *(Shipped: `/dashboard/klachten` — a `Complaint` model + groei-gated register
      (open → in behandeling → afgehandeld → doorverwezen) and a "Klachtenprocedure
      & -register" evidence PDF. Framed honestly: Art 85 is an EXTERNAL right of any
      person to complain to the markttoezichthouder (from 2 Aug 2026, not a deployer
      duty); the internal mechanism is only legally required inside a FRIA, which
      binds only the narrow Art 27(1) subset — good governance for everyone else.)*
- [ ] **EU-database registration tracker** — Art 49, Art 71, Art 26(8) (public
      bodies). Status per system (future — DB not yet live).
- [x] **DPIA template / linkage** — Art 26(9) + GDPR Art 35 (FRIA complements it,
      Art 27(4)). *(Shipped as a LIGHT linkage — a new `dpia` document type in the
      Documenten module (groei), not a GDPR/DPIA builder. Maps what the AI-register/
      FRIA/Art-13 info already capture onto the DPIA (Art 26(9)), leaves the AVG
      Art 35(7) analysis as fill-in, notes the FRIA complements the DPIA (Art 27(4)),
      and is explicit it's "geen volledige DPIA, geen AVG-tool en geen juridisch
      advies". The DPIA duty is framed as CURRENT under the AVG; the Art 26(9) overlay
      applies 2 Dec 2027.)*
- [x] Fold deployer post-market monitoring (Art 26(5)) into the existing
      governance kwartaalcheck cadence. *(Shipped: a high-risk-gated
      "Werking hoog-risico AI gemonitord (Art. 26(5))" check in
      `lib/governance/score.ts`; done reflects no outstanding escalations
      (open incidents + open/in-behandeling complaints) — ties the monitoring
      loop to the meldingen/klachten surfaces. Get-ready framing: Art 26(5)
      binds from 2 Dec 2027. Pure code, no schema change.)*

### Wave 3 — provider / maker duties (Audit tier)
- [x] **Quality management system** — Art 17 (simplified for micro-enterprises,
      Art 63). *(Shipped as a LIGHT fill-in `qms` document type in the Documenten
      module (schaal), mirroring tech_doc/doc_conformity. Scaffolds all 13 Art 17(1)
      (a)–(m) elements; opens with a provider-role gate ("een KMS is een aanbieders-
      plicht; als u alleen gebruiksverantwoordelijke bent geldt Art. 17 niet voor u")
      and the Art 63(1) MICRO-enterprise-only simplification (pending Commission
      guidelines; Art 63(2) preserves all other duties). Applies 2 Dec 2027.)*
- [x] **Post-market monitoring plan** — Art 72 (part of the Annex IV tech doc).
      *(Shipped as a LIGHT `postmarket_plan` document type (schaal). Scaffolds the
      Art 72(1)–(2) plan content; provider-gated and explicitly distinguished from
      the deployer's Art 26(5) kwartaalcheck; notes it is Annex IV point 9 of the
      tech doc (Art 11 mkb-simplification) and that the Commission template is due
      2 Feb 2026 — so framed as prep. Applies 2 Dec 2027.)*
- [x] **Conformity-assessment tracker** — Art 43, Art 47, Art 48 (steps + status;
      complements the existing EU-conformiteitsverklaring doc). *(Shipped:
      `/dashboard/conformiteit` — a `ConformityAssessment` model (1:1 per high-risk
      system, route + a `steps` JSON checklist), schaal-gated, with a per-system
      6-step tracker (tech doc, QMS, assessment, EU-DoC Art 47, CE Art 48, EU-db
      Art 49) + route (Annex VI/VII) + a "Conformiteitsbeoordeling — statusoverzicht"
      evidence PDF. Provider-scoped; Art 49 EU-database caveat; applies 2 Dec 2027.)*
- [x] **Corrective-action log** — Art 20 (ties to the incident register).
      *(Shipped: `/dashboard/corrigerend` — a `CorrectiveAction` model + register
      (bring into conformity / withdraw / disable / recall; open → in behandeling →
      afgehandeld) with an Art 79(1)-risk flag that surfaces the Art 20(2) authority
      + notified-body duty, an "informed" field for the supply chain, and a register
      evidence PDF. Provider-scoped (schaal); framed as distinct-but-linkable to the
      Art 73 incident register; applies 2 Dec 2027.)*

Out of scope (guardrail): Art 26(10) law-enforcement post-remote biometric
authorisation — no law-enforcement sector logic in this product.

## Risicoscan — accuracy + relevance (planned, two phases)

The scan is how we build the picture of a customer's business, so it must be
correct, deep enough, and still understandable. It currently does two jobs:
recommends a pakket and pre-fills dashboard data. We're adding a third:
driving what each customer *sees*.

- **Phase A — audit the scan (do first).** Verify every question against
  `docs/regulatory/ai-act-full-text.md`: coverage (provider/deployer split,
  Annex III high-risk triggers, Art 5 prohibitions incl. the two new ones,
  Art 50 transparency, GPAI, FRIA scope (Art 27), Art 6(3) carve-out,
  Art 4 literacy), correctness (answers → right classification, verbatim-
  grounded, no over-calling — guardrail #2), currency (Digital Omnibus dates),
  and comprehension (plain Dutch, branch length, result-screen clarity).
  Report-first, then fix one classification rule at a time (CLAUDE.md rules).
  - **Phase A — done (audit + first fixes).** Multi-agent audit found the scan
    engine fundamentally sound (the four correctness-spec bugs stay fixed; nothing
    a blocker). First fix landed: the adjacent **AI-register keyword classifier**
    (`lib/register/classify.ts`) was riddled with substring false positives that
    leaked into `companySignals` product-wide. Rewritten to match on *context*
    (positive lookaheads) not bare fragments, grounded verbatim, with a 65-case
    regression test (`lib/register/__tests__/classify.test.ts`). Fixes: fraud
    carve-out (Annex III 5(b)), Art 5 de-escalation incl. the narrow Art 5(1)(h)
    RBI case, medical→Annex I/Art 6(1), life/health-only insurance (5(c)), and the
    verkoopcijfers/datamigratie/ticket-triage/kredietbeheer class of over-calls.
    **Fix waves (each adversarially verified, grounded verbatim, test-locked):**
    - **Wave A — done.** Register-classifier false positives (above).
    - **Wave B — done.** Emotion medical/safety sub-question (Art 5(1)(f)) so the
      "Verboden" banner can't be a false positive; engine rule was already correct,
      the wizard just never collected the qualifier.
    - **Wave C — done.** Scope correctness: Art 4 emitted after scope-derived roles
      (#8); research/military/3rd-country-LE short-circuit to excluded, personal
      (Art 2(10)) kept as a narrower caveat-only exemption so Art 5 still surfaces
      (#4); Annex I §B no longer over-emits (Art 2(2), #5); Art 25 modification step
      added + promotion gated on isHigh (#7).
    - **Wave D — done.** Comprehension + doc drift: decision-changing caveats now
      surfaced in a prominent "Let op" card near the top (not buried); the third-
      party-conformity boolean is Ja/Nee/Weet-ik-niet with examples ("weet ik niet"
      → verification caveat, no over/under-call, #2); Annex III areas gained plain
      "Bijv. …" examples (area 4/HR leads) and the (5b)/(5c)/(6d) codes left the
      labels; "Annex III" → "de wettelijke lijst … (bijlage III)"; correctness-spec
      Bug-6 table realigned to timeline.ts (Art 50 = 2 Dec 2026, pending OJ).
    **Phase A complete** — next is **Phase B (scan-driven visibility)** below.
    **Scan-engine backlog (pre-existing, low):** Annex I §B stays unreachable in the
    live wizard by design (scope rule #4 — route to sectoral law, don't build §B);
    ART_25_HANDOVER obligation text vs Art 25(2) party-direction is a wording nuance.
    **Register-classifier backlog (pre-existing gaps, not regressions):** Annex III
    5(d) emergency-call/dispatch triage (uncovered); disability-insurance ambiguity;
    LE public-authority phrasings. Deferred — the tool stays an advisory suggester.
- **Phase B — scan-driven visibility — DONE.** A pure `lib/compliance/relevance.ts`
  (`surfaceRelevance` + `surfaceState`) layer on top of the `lib/plan.ts` pakket
  gate — relevance ⟂ tier, re-derived LIVE from the profile + AI-register, keeping
  high vs high_notify separate and pairing role+risk per system (bypasses the
  coarse `companySignals`). Three states per surface: **not relevant →
  de-emphasized, NOT hidden** (reveal), **relevant + tier too low → locked**,
  **relevant + covered → shown**. Shipped as 8 small PRs (each adversarially
  verified / test-locked / browser-verified): PR0 layer + 21 invariant tests · PR2
  nav · PR3 overview grid + primitives (fixed an admin-card leak) · PR4 documents ·
  PR5 the four deployer modules · PR6 the two provider modules (biggest
  false-positive win: a deployer no longer sees Art. 43/20) · PR7 e-learning
  markers pre-unlock · PR8 the "wat geldt niet voor u" obligations reveal + a
  **re-scan nudge** when the live register implies heavier duties than the last
  scan (surface, don't auto-bump — CLAUDE.md rule #2/#3). Invariant held: the
  recommended pakket unlocks every relevant-and-required duty for scan-derived
  relevance; register-driven divergence is exactly what the PR8 nudge covers.

## Open items

- Re-verify the Digital Omnibus dates against the published OJ (EUR-Lex) once the
  regulation number lands (~late Jul 2026); correct content if the final text
  differs. See `memory: ai-act-application-dates`.
