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
- [ ] **Quality management system** — Art 17 (simplified for micro-enterprises,
      Art 63).
- [ ] **Post-market monitoring plan** — Art 72 (part of the Annex IV tech doc).
- [ ] **Conformity-assessment tracker** — Art 43, Art 47, Art 48 (steps + status;
      complements the existing EU-conformiteitsverklaring doc).
- [ ] **Corrective-action log** — Art 20 (ties to the incident register).

Out of scope (guardrail): Art 26(10) law-enforcement post-remote biometric
authorisation — no law-enforcement sector logic in this product.

## Open items

- Re-verify the Digital Omnibus dates against the published OJ (EUR-Lex) once the
  regulation number lands (~late Jul 2026); correct content if the final text
  differs. See `memory: ai-act-application-dates`.
