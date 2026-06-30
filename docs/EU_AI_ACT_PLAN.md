# ComplAI — Regulation-grounded redesign plan

> Source-grounded in Regulation (EU) 2024/1689 (read directly: Art. 5 pp.51-53,
> Art. 6/7 pp.53-55, Annex III pp.127-129, Annex IV pp.130-131, penalties
> pp.115-118, Art. 113 p.123) and the official Future of Life "EU AI Act
> Compliance Checker" flowchart (v1.0, 28 Jul 2025). Produced by a multi-agent
> research + synthesis + legal fact-check pass.
>
> **Product caveat to enforce everywhere:** ComplAI mirrors the *logic* of the AI
> Act; it is **decision support, not legal advice and not a guarantee of
> compliance**. Every scan result, document and tier recommendation carries a
> Dutch "geen juridisch advies / geen garantie op naleving" disclaimer and a
> "laat toetsen door een jurist" CTA. Several steps are deliberate
> simplifications (self-assessed booleans for legal determinations) — flagged.

## Why this change

The scan today is a dead-end: it computes a flat weighted score, but the
dashboard, documents, e-learning and governance read **seeded `compliance_items`**
— not the user's answers. `size`/`sector` are never used. Classification is
regex heuristics, not the real Art. 5 / Art. 6+Annex III / Art. 50 / GPAI logic.
Goal: the scan should produce a **compliance profile** that (a) is legally
grounded, (b) drives every module, and (c) recommends a **needs-based** plan.

---

## A) Revised questionnaire (mirrors the official checker)

**Principles:** it's a directed graph, not a linear funnel — terminal nodes
*append* obligations, so one company can be `high-risk + transparency + AI-literacy`
at once. Global state: `entityRole[]`, `riskTier[]`, `systemFlags{gpai,profiling}`,
`inScope`. Order mirrors the official flow: Entity → High-risk status →
Scope/exclusions → Particular-system rules. Risk is assessed **per AI system**.

Sections (Dutch in product; English here):

- **Section 0 — Company basics:** size, sector (feeds pricing/profile, never decisive).
- **Section E — Entity role (Art. 3, 25):** provider / deployer / importer /
  distributor / product manufacturer / authorised representative. Provider OR
  deployer → `AI_LITERACY` (Art. 4). Art. 25 modifications can mutate a
  non-provider into a provider downstream.
- **Section HR — High-risk status (Art. 6/7, Annex I & III):** Annex I product
  routes (only high-risk **with** third-party conformity assessment), then Annex
  III area picker (1 Biometrics · 2 Critical infrastructure · 3 Education · 4
  Employment · 5 Essential services incl. credit/insurance · 6 Law enforcement ·
  7 Migration · 8 Justice/democracy), then the **Art. 6(3) carve-out** gate +
  mandatory **profiling** question (profiling → forced high-risk).
- **Section S — Scope/territorial test (Art. 2):** sets `inScope`, confirms
  roles, sets the **GPAI model** flag. "none" → out of scope.
- **Section R — Particular-system rules:** GPAI systemic-risk (Art. 51/55),
  exclusions (military/LE/R&D/FOSS/personal — Art. 2), **prohibited practices
  (Art. 5)** as a hard-stop verdict, **transparency (Art. 50)** split by
  role/content, **FRIA (Art. 27)** gate.

Each answer maps to an emitted obligation code + article + risk tier + which
module it drives (full table lives in the synthesis; key ones: Annex III area →
candidate high-risk; profiling → `HIGH_RISK`; Art. 6(3) cleared + no profiling →
`NOTIFY_NCA` non-high-risk-with-docs; Art. 5 tick → `PROHIBITED` hard stop;
Art. 50 → `TRANSP_*`; public body / credit / insurance deployer → `FRIA`).

---

## B) The compliance-profile engine (the spine)

New canonical type `ComplianceProfile` = `{ inScope, exclusions[], entityRoles[],
riskTiers[], systemFlags, applicableArticles[], obligations[] (code, article,
title, status, required, evidenceKind, deadline), documents{required,recommended},
training{required,recommended}, recommendedTier, advisoryUpsell?, score, level,
caveats[] }`.

**Pipeline** `lib/compliance/profile.ts → buildProfile(answers, companyData)`:
1. Walk the decision graph (`lib/compliance/decisionTree.ts`) → obligation codes + tiers + flags. (Replaces `lib/scan/scoring.ts`.)
2. Expand codes → full obligation items (`lib/compliance/obligations.ts`); attach deadlines from the Art. 113 timeline (`lib/compliance/timeline.ts`).
3. **Resolve done/open against real company data** (`lib/compliance/resolve.ts`): document exists / training completed / systems registered → `done`. *This is what makes the dashboard reflect reality.*
4. Derive required vs recommended documents & training.
5. Score = `done_required / total_required`; `PROHIBITED` caps it; out-of-scope = banner. **Never labelled "compliant" — labelled "gereedheid/voortgang".**
6. Recommend a tier (Section C). 7. Collect caveats for self-assessed gates.

**Storage (minimal additions):** keep `scan_results.answers`; add
`scan_results.profile` (JSON snapshot); add `Company.{plan, entityRoles[],
riskTiers[], profileJson}`; add `ComplianceItem.{code, required, deadline}`.
**Linchpin:** on scan submit / post-signup, **upsert one `ComplianceItem` per
obligation** — the dashboard & governance already read `ComplianceItem`, so this
instantly wires them to the scan. `recomputeProfile(companyId)` re-runs on any
register/document/training change → one canonical score everywhere.

**Each module consumes the profile:** dashboard (score + article cards from
obligations), register (per-system classification via the HR graph, not regex),
documents (show required vs recommended; new templates: Annex IV technical file,
EU DoC, Art. 6(4) non-high-risk assessment record, GPAI docs), e-learning
(AI-literacy base path required; Art. 14 oversight path for high-risk deployers),
governance (checks = open required obligations by deadline), pricing
(`recommendPlan`).

---

## C) Needs-based pricing (by obligations faced, not seats)

| Tier | For whom (by profile) | Includes |
|---|---|---|
| **Gratis / Verkenning** | out-of-scope / excluded / minimal (literacy only) | scan + PDF, read-only register (≤3), AI-literacy e-learning. No legal docs. |
| **Starter — Transparantie** | limited-risk: any Art. 50 obligation, no high-risk | + transparency document pack, Art. 50 + Art. 4 paths, register ≤~10, basic governance calendar. |
| **Groei — Hoog risico** | high-risk **deployer**, `NOTIFY_NCA`, or `FRIA` triggered | + FRIA template (Art. 27), Art. 26 deployer pack (oversight, logging ≥6 mo, worker notice), registration helper (Art. 49), full governance, Art. 14 training. |
| **Schaal — Provider/GPAI** | high-risk **provider** (Art. 16), GPAI model provider, or 250+ | + Annex IV technical-doc builder, QMS scaffold (Art. 17), EU DoC + CE guidance, conformity checklist (Art. 43), GPAI templates, systemic-risk pack, unlimited systems, audit. |

`recommendPlan(profile)`: GPAI/HR-provider → Schaal; HR-deployer/FRIA/NOTIFY_NCA
→ Groei; any TRANSP_/limited → Starter; else Gratis. 250+ bumps one tier.
PROHIBITED → red "stop-use" banner, not an upsell.

**Advisory upsell (the explicit ask):** when limited-risk *today* but adjacent to
high-risk (Annex III area but Art. 6(3) carve-out claimed; or a tool that could
become high-risk on a purpose change), set `advisoryUpsell` recommending one tier
up, **clearly labelled "aanbevolen, niet verplicht"**, and shown as concrete
prepared artefacts (FRIA, oversight policy ready to go), not just a price.

---

## D) Phased build sequence (each phase shippable)

1. **Profile engine + write-back (linchpin).** New `lib/compliance/*`; rewrite
   `app/scan/actions.ts` to compute + persist profile, write `Company` fields,
   **upsert `ComplianceItem`s**. Schema additions. Keep old questions for now.
   → dashboard + governance immediately reflect the scan.
2. **Regulation-grounded questionnaire.** Replace `lib/scan/questions.ts` with
   the Section A graph; Art. 5 capping verdict; Annex III + Art. 6(3) + profiling;
   Art. 50 by role/content; GPAI branch; wizard branching UI.
3. **Needs-based pricing + recommendation.** `recommendPlan` + `advisoryUpsell`;
   redefine tiers; "aanbevolen voor u" on results + pricing; register limits.
4. **Module personalisation.** Document requirements + new templates;
   training required/recommended; rewrite governance to read profile.
5. **Per-system loop + recompute integrity.** Risk questions per `AiSystem`;
   `recomputeProfile` on mutations; one canonical score.

---

## Legal-accuracy corrections to fold into A/B (from the fact-check)

These were caught in review and **must** be applied:

1. **Annex I Section B (transport/aviation) is not auto high-risk** — route it
   through the third-party-conformity gate; those regimes defer largely to
   sectoral law (Art. 6(1) + Arts. 102-109, 112).
2. **Predictive policing (Art. 5(1)(d))** — only individual criminal-offence risk
   prediction based *solely* on profiling/personality; carve out human-support on
   objective facts. Area/location predictive policing is *not* Art. 5.
3. **Real-time RBI (Art. 5(1)(h))** — has strict-necessity exceptions (victim
   search, imminent threat, locating a suspect for a serious offence). Add a
   qualifier; post (non-real-time) RBI is high-risk (Annex III 1(a)), not prohibited.
4. **FRIA (Art. 27)** = (public body / public-service provider deploying any
   Annex III high-risk *except* point 2) **OR** (any deployer of 5(b) credit /
   5(c) insurance). Don't gate 5(b)/5(c) behind the public-body answer.
5. **GPAI ≠ generative-tool deployer.** Art. 53/55 bind GPAI *model providers*. A
   deployer of a chatbot carries at most Art. 50; don't sell GPAI-provider duties
   to deployers.
6. **Systemic-risk threshold** — add the >10²⁵ training-FLOP presumption (Art.
   51(2)) and the Art. 52 Commission-notification (2 weeks) obligation.
7. **Art. 50(1)/(2) are provider duties** — for the typical deployer of a
   third-party chatbot, surface an *informational note* (duty sits upstream),
   don't relabel as the deployer's legal obligation.
8. **Art. 50(4)** — add the artistic/satirical deepfake carve-out and the
   editorial-responsibility exception for public-interest text.
9. **`NOTIFY_NCA` is "non-high-risk with documentation/registration duty"**, not
   "limited risk" — give it its own tier label; and Art. 49(2) registration is a
   *provider* duty, not a pure deployer's.
10. **Timeline anchoring:** AI literacy (Art. 4) & prohibitions (Art. 5) → 2 Feb
    2025 (in force); GPAI (Ch. V) → 2 Aug 2025; Art. 50 + Annex III → 2 Aug 2026;
    Annex I high-risk (Art. 6(1)) → 2 Aug 2027.
11. **FOSS exclusion** — split system-level (Art. 2(12)) from GPAI-model-level
    (Art. 53(2)); never exempts systemic-risk models.
12. **Auth. rep** — Art. 22 (high-risk system provider) vs Art. 54 (GPAI model
    provider) generate different document sets; branch them.
13. **Prohibited overrides high-risk** for the same system (emotion recognition
    in workplace/education = prohibited; elsewhere = high-risk). Don't sell a
    high-risk pack for a prohibited system.
14. **Never render the score as "compliant/conform"** — it's "gereedheid".
    Enforce the disclaimer on pricing/results surfaces, not just the scan.

---

## E) Open decisions (confirm before building)

1. Per-system vs per-company at scan time (v1: single "primary system" in the
   public scan, full per-system loop inside the register?).
2. GPAI scope — ship GPAI *provider* obligations now, or defer to v2 with a note
   (most customers are deployers)?
3. Art. 6(3) carve-out UX — allow self-select (with caveat + generated assessment
   record) or gate behind a "laat toetsen" review?
4. Score semantics — confirm `done_required/total_required`, prohibited caps,
   out-of-scope = banner; retire the competing dashboard/governance means.
5. `ComplianceItem` — drop seed creation; everything flows from the profile?
6. Plan enforcement — hard caps or warn-and-upsell? Provision real Stripe products
   now or keep stubbed?
7. Pricing numbers — actual €/month per tier + SME framing.
8. Legal sign-off — a jurist reviews the Dutch template library before launch.

---

## Build progress / resume here

**Decisions locked (user):** build phase by phase; **defer GPAI** provider
paperwork to v2 (detect + inform only); Art. 6(3) carve-out = **self-select with
generated record**.

**Done — Phase 1 core (commit `ef02dac`, NOT yet pushed):** the additive
`lib/compliance/*` engine — `types`, `questions` (grounded answer shape +
options), `timeline`, `obligations` (catalogue), `engine.ts` (`classify()` with
all 14 fact-check corrections), `resolve.ts`, `profile.ts` (`buildProfile()`).
`tsc` clean; smoke-tested across 5 scenarios (high-risk, credit→FRIA, chatbot
advisory, out-of-scope, prohibited-overrides-high-risk) — all correct. Nothing
imports it yet, so the running app + live deploy are unchanged.

**Next — finish Phase 1 wiring (task 16), then Phase 2:**
1. **Schema** (additive, nullable): `Company.{plan,entityRoles[],riskTiers[],profileJson Json?}`,
   `ScanResult.profile Json?`, `ComplianceItem.{code String?, required Boolean?, deadline DateTime?}`.
   `prisma migrate dev` locally; apply to Supabase prod via the Supabase MCP
   (`apply_migration`) at deploy time.
2. **New wizard (Phase 2)** — the scan must collect the new `ScanAnswers` shape
   (`lib/compliance/questions.ts`), branching per Section A. (Phase 1 wiring is
   only meaningful with these inputs — the old 10 questions don't carry roles /
   Annex III areas / etc.)
3. **Wire `app/scan/actions.ts`** — `buildProfile(answers, evidence)`; persist
   `scan_results.{answers,profile}`; if company known, write `Company` fields and
   **upsert one `ComplianceItem` per obligation** (this lights up dashboard +
   governance, which already read `ComplianceItem`).
4. **Rewire** `app/dashboard/page.tsx` + `lib/governance/score.ts` to read the
   profile / materialised items instead of seeded data. Build evidence via a
   `lib/compliance/evidence.ts` helper (documents/training/register counts).
5. Verify (`tsc` + dev-server scenario), commit, then push to deploy.

**Discipline:** commit clean units; do NOT push until a phase is verified
(keeps `complai-tau.vercel.app` safe). A mid-edit cutoff → `git checkout .`.

---

## ✅ Phase 1 COMPLETE (commits `ef02dac` → `356608a`, NOT pushed)

Scan → compliance profile → results/PDF + dashboard, all profile-driven and
regulation-grounded. New branching wizard collects the grounded answers; logged-in
scans write `Company.profileJson` + materialise `compliance_items`; the resolver
reflects real company data (docs/training/register). `tsc` clean; verified
end-to-end in demo mode. Live site untouched (not pushed).

**Small follow-ups (not blocking):**
- `lib/governance/score.ts` still checks fixed articles (Art. 4/5/50/6) — light
  rewire to read the profile/obligations generically (renders fine meanwhile).
- `lib/scan/{questions,scoring,status}.ts` are now unused — safe to delete.
- Documents/e-learning could consume `profile.documents`/`profile.training`
  (Phase 4) to show required-vs-advised.

**To DEPLOY Phase 1 (when ready):**
1. Apply the `compliance_profile` migration to **prod Supabase** via the Supabase
   MCP `apply_migration` (Company.{plan,entity_roles,risk_tiers,profile_json},
   scan_results.profile, compliance_items.{code,required}).
2. `git push origin main` → Vercel redeploys.
3. Re-run the scan on the live site to populate the new profile.

---

## Backlog (post-launch-readiness, not strictly a numbered phase)

### Full working demo dashboard (`/demo`)
**Problem:** `/demo` is today a single static overview page. The module row
(Overzicht · AI-register · Schaduw-AI · Documenten · E-learning · Governance ·
Kennisbank) is decorative **chips, not links** — clicking them does nothing.

**Goal:** make `/demo` a **fully navigable, read-only** dashboard that is
**visually identical to the real `/dashboard`** (same layout, components, sidebar,
styling), populated with **fictional but realistic** data for "Demo Recruitment
B.V." Every tab should actually open its own page (demo AI-register with sample
systems, demo Schaduw-AI, demo Documenten, demo E-learning, demo Governance), so a
visitor experiences the real product before signing up. The "U bekijkt een demo
met voorbeelddata" banner stays persistent; all mutating actions are disabled.

**Approach (decide at build time):**
- **Option A — `/demo/*` route group reusing the real dashboard components** with
  a demo data source (a fixed fictional company built via `buildProfile` + sample
  `AiSystem`/`Document`/`Employee` fixtures), no auth, read-only. Cleanest
  separation; no risk to the real auth-protected dashboard.
- **Option B — public "demo mode" on the real dashboard** for a seeded fictional
  company, bypassing middleware for `/demo`. Less duplication but riskier (must
  guarantee no writes + no real-company data leaks).
- Lean Option A. Extract the dashboard page bodies into shared components that take
  data as props, so both `/dashboard/*` (real, from `getActiveCompany`) and
  `/demo/*` (fictional fixtures) render the same UI from different data.
- Read-only enforcement: hide/disable every form, generate, delete and checkout
  action; the demo never touches the DB.

**Why it matters:** the competitor's demo is a real clickable dashboard; ours must
be too. It's the highest-credibility "see the product" moment before payment.

### Phase 4 guardrails to bake into the document generator (decided with user)
Generated documents are **editable concept-scaffolds**, never finished legal
instruments: stamp every output "concept — zelfverklaard, vul aan en laat toetsen,
geen juridisch advies / geen garantie op naleving." Inputs are self-declared; no
lawyer-client relationship. The one thing that still needs a real legal pass is the
company's **own Terms of Service + liability disclaimer** (protects us), not the
compliance templates themselves.
