# complai-eu.nl — Correctness Spec for the Risicoscan

**For the coding agent. Scope: complai-eu.nl (Dutch SMEs) ONLY.**
**Contains NO aviation or EASA content. Do not add any.**

Source: Regulation (EU) 2024/1689, OJ L, 12.7.2024 — read in full, 11 July 2026.

---

## Why this exists

The risicoscan is a **rules engine**, not a questionnaire. Right now it is likely producing **false positives** — telling Dutch SMEs they are high-risk when the Regulation says they are not, and that they need a FRIA when they almost certainly do not.

For a compliance vendor, a false positive is worse than a missing feature. The customer's lawyer checks, finds you over-called the law, and you are finished. Accuracy is the product.

**Implement these as a declarative rule set with article citations, not as prose in a prompt.** Every output must be traceable to an article.

---

## BUG 1 — FRIA is massively over-scoped (Art 27)

**Current behaviour:** FRIA is presented as a general feature / obligation.

**The law — Art 27(1), verbatim scope:** a FRIA is required only from:

- **deployers that are bodies governed by public law**, or
- **private entities providing public services**, or
- deployers of high-risk AI under **Annex III point 5(b)** (creditworthiness / credit scoring) or **5(c)** (risk assessment & pricing in life and health insurance)

...and **not** for Annex III point 2 (critical infrastructure).

**Therefore: a typical Dutch SME needs NO FRIA.** A bakery, a marketing agency, a webshop, a consultancy — none of them.

**Fix:**
```
requires_FRIA =
     is_public_law_body
  OR is_private_entity_providing_public_services
  OR uses_annex_III_5b_credit_scoring
  OR uses_annex_III_5c_life_health_insurance_pricing
```
If false → state plainly: **"U heeft geen FRIA nodig (art. 27 AI-verordening)."**

**This is a selling point, not a loss.** "We tell you what you *don't* need" is devastating to a buyer who has been quoted €5.000 by a consultant for a FRIA they never needed.

---

## BUG 2 — The Art 6(3) derogation is missing (the false-positive filter)

**Current behaviour (suspected):** "Do you use AI for recruitment?" → YES → HIGH RISK. **This is wrong.**

**Art 6(3), verbatim:** an Annex III system is **NOT** high-risk where it does not pose a significant risk of harm, and **any one** of these holds:

- **(a)** performs a **narrow procedural task**
- **(b)** **improves the result of a previously completed human activity**
- **(c)** detects decision-making patterns or deviations, and is **not meant to replace or influence the previously completed human assessment without proper human review**
- **(d)** performs a **preparatory task** to an assessment relevant to an Annex III use case

**Hard override — Art 6(3), final subparagraph:**
> *"Notwithstanding the first subparagraph, an AI system referred to in Annex III shall **always** be considered to be high-risk where the AI system performs **profiling of natural persons**."*

**Fix — required logic:**
```
if annex_III_match:
    if performs_profiling_of_natural_persons:
        → HIGH RISK   (no derogation available, Art 6(3) final subpara)
    elif (narrow_procedural_task
          or improves_prior_human_result
          or pattern_detection_with_human_review
          or preparatory_task):
        → NOT HIGH RISK, via Art 6(3) derogation
        → BUT SEE BELOW
    else:
        → HIGH RISK
```

**Critical — the derogation is not "you're free." Art 6(4):**
> *"A provider who considers that an AI system referred to in Annex III is not high-risk **shall document its assessment** before that system is placed on the market or put into service. Such provider **shall be subject to the registration obligation set out in Article 49(2)**."*

**So "not high-risk" produces two deliverables:** a **documented derogation assessment** and an **Art 49(2) registration**.

The honest answer still sells. Build the derogation-assessment document generator. Nobody else has one.

---

## BUG 3 — Article 2 scope exclusions are missing

The scan must exclude these **before** any risk classification runs:

| Exclusion | Article | Rule |
|---|---|---|
| Products under **Annex I Section B** | **Art 2(2)** | Only Art 6(1), 102–109, 112 apply. **Chapter III does NOT apply directly.** §B includes: aviation security (300/2008), 2/3-wheel vehicles (168/2013), agricultural & forestry vehicles (167/2013), marine equipment (2014/90), rail (2016/797), motor vehicles (2018/858, 2019/2144), **unmanned aircraft (2018/1139)**. → **A Dutch SME making e-bike parts, agri-machinery components, or drone parts hits this.** |
| Military / defence / national security | Art 2(3) | Out of scope entirely |
| Scientific research & development | Art 2(6) | Out of scope ("sole purpose") |
| Research, testing, development **pre-market** | Art 2(8) | Out of scope — **but real-world testing is NOT excluded** |
| Purely personal, non-professional use | Art 2(10) | Out of scope |
| **Free and open-source** AI systems | Art 2(12) | Out of scope — **unless** placed on market as high-risk, or falling under Art 5 or Art 50 |

---

## BUG 4 — Biometric verification is not high-risk

**Annex III point 1(a), verbatim:**
> *"This shall not include AI systems intended to be used for **biometric verification** the sole purpose of which is to confirm that a specific natural person is the person he or she claims to be."*

**1:1 verification (face/fingerprint login, identity confirmation) → NOT high-risk.**
**1:many remote biometric identification → high-risk.**

Many SMEs use biometric login. If the scan flags that as high-risk, it is wrong.

---

## BUG 5 — Art 4 penalty framing

**Art 4 (AI literacy) is binding but has NO standalone fine.** It is not listed in the Art 99 penalty tiers. Non-compliance escalates penalties for *other* breaches.

**Do not imply an Art 4 fine.** Say what's true: it is a legal obligation in force since 2 Feb 2025, and non-compliance aggravates other penalties.

**Art 99 tiers, correctly:**
- **Art 5** (prohibited practices) → **€35M / 7%**
- Obligations of providers (Art 16), authorised reps (22), importers (23), distributors (24), **deployers (26)**, transparency (50) → **€15M / 3%**
- Incorrect/misleading information to authorities → **€7.5M / 1%**

---

## BUG 6 — Timeline must reflect the Digital Omnibus

`lib/compliance/timeline.ts` is the operational source of truth; keep this table in
sync with it. Every Digital-Omnibus date is `pending_publication` — adopted
(Parliament 16 Jun, Council 29 Jun 2026) but not yet in the Official Journal
(expected ~late Jul 2026). Until it publishes, the ORIGINAL Art. 113 date formally
applies, so the UI carries a "publicatie in afwachting" caveat.

| Obligation | Applicable date | Basis |
|---|---|---|
| Art 5 prohibited practices (original) | **LIVE — 2 Feb 2025** | Art 113 |
| Art 4 AI literacy | **LIVE — 2 Feb 2025** | Art 113 |
| GPAI (Ch. V), governance, penalties | **2 Aug 2025** | Art 113 |
| Art 50 transparency (existing systems) + 2 new Art 5 prohibitions (NCII, CSAM) | **2 Dec 2026** (was 2 Aug 2026) | Digital Omnibus |
| **Annex III high-risk obligations** | **2 Dec 2027** (was 2 Aug 2026) | Digital Omnibus |
| Annex I high-risk (AI in regulated products) | **2 Aug 2028** (was 2 Aug 2027) | Digital Omnibus |

Keep this in sync with `timeline.ts`, keep the "wetgeving kan wijzigen / publicatie
in afwachting" caveat, and re-verify against the published OJ (~late Jul 2026).

---

## NEW — track the Commission's Art 6 guidelines

The Commission published **draft guidelines on high-risk classification (Art 6) on 19 May 2026** (they were due 2 Feb 2026). **Consultation closes 23 July 2026.**

These guidelines contain the Commission's own worked examples of what is and is not high-risk. When final, they are the authoritative interpretation of Bugs 2 and 4 above.

**Action:** ingest them into the rule set when adopted. Until then, mark derogation outcomes as *"gebaseerd op art. 6(3); de Commissie-richtsnoeren zijn nog in concept."*

---

## Architecture note — do this now, before aviation

Restructure the rule set so the regulation is **data**, not code:

```
framework          e.g. "EU AI Act 2024/1689"
 └─ obligation
     ├─ id, text, source_ref            (article / annex point)
     ├─ applicability_rule              (role | risk class | sector | derogation)
     ├─ required_artifact               (document template)
     ├─ guidance / moc                  (NULLABLE)
     └─ evidence_status                 (per tenant)
```

Then:
- another **language** = a translation layer
- another **jurisdiction** = a data load
- another **framework** (later, elsewhere) = one new row — **not a rewrite**

**Do NOT add aviation or EASA content to complai-eu.nl.** That belongs in a separate product. The point of this refactor is that it *can* live elsewhere without forking the engine.

---

## Test cases the agent must make pass

| # | Input | Correct output |
|---|---|---|
| 1 | Bakery, uses ChatGPT for marketing copy | Not high-risk. Art 4 applies. **No FRIA.** |
| 2 | Recruitment agency, AI ranks CVs and scores candidates | **High-risk** (Annex III 4(a)). Profiling → no derogation. No FRIA (private, not public service). |
| 3 | SME, AI parses CVs into a structured format only; humans do all evaluation | **Not high-risk** — Art 6(3)(a) narrow procedural task. **But must document the derogation assessment (Art 6(4)) + register (Art 49(2)).** |
| 4 | SME uses fingerprint login for staff | **Not high-risk** — Annex III 1(a) verification carve-out. |
| 5 | Municipality deploying AI for benefits triage | High-risk **and FRIA required** (body governed by public law, Art 27). |
| 6 | SME building drone components | **Art 2(2)** — Annex I §B. Chapter III does not apply directly. Route to sectoral regulation. |
| 7 | SME's AI infers employee emotions from webcam | **PROHIBITED — Art 5(1)(f).** €35M / 7%. Live now. |
| 8 | University spin-out, AI for research only, not on market | **Out of scope** — Art 2(6). |

---

## The commercial tension — name it, don't hide from it

An accurate scan converts worse than an over-calling scan. Telling a bakery "you're fine" loses an upsell.

**That is the same sin as the fake deadline.** Don't do it.

**And you don't have to:** Art 4 applies to *everyone* who uses AI — that's an honest floor. And Art 6(4) means even "not high-risk" requires a **documented assessment and registration**. The correct answer always has a deliverable attached.

**Sell accuracy. It's the only durable thing a compliance vendor has.**
