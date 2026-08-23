# ComplAI — working notes

Dutch-language EU AI Act compliance SaaS. Next.js 14 (App Router) · TypeScript ·
Tailwind + shadcn/ui · Supabase auth · Prisma 6 → Postgres · @react-pdf/renderer
· Stripe + Resend.

## Gotchas (read these first)

- **Slow filesystem (iCloud).** The repo lives under `com~apple~CloudDocs`, which
  makes `next build` / `tsc` pathologically slow (minutes) and leaves stuck
  worker processes. Prefer **`tsc --noEmit` for type checks** and run builds in
  the **background**; don't casually run a full `next build` in the foreground.
- **Prisma is pinned to 6 on purpose.** v7 removes the `url = env("DATABASE_URL")`
  datasource model and needs `prisma.config.ts` + a driver adapter. Do not
  upgrade without that migration. (The `package.json#prisma` deprecation warning
  is expected and harmless on 6.)
- **Demo mode.** Locally `.env` has the Supabase vars **blanked**, so the app
  runs without auth: middleware passes through and `getActiveCompany()`
  (`lib/auth.ts`) falls back to the seeded demo company. Add real Supabase keys
  to `.env` to turn auth + route protection back on.
- **Stripe & Resend are stubbed** when keys are absent (`lib/stripe.ts`,
  `lib/resend.ts`): checkout/portal return a message, emails log to console.

## Local dev / DB

- DB is a throwaway Docker Postgres: `complai-pg` on **port 5433**
  (`DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/complai`).
  Real setup uses the Supabase CLI (`supabase start`) — see README.
- `npm run dev` · `npm run db:seed` (idempotent: 1 company, 3 AI systems, sample
  scan, compliance items, 3 employees) · `npm run db:migrate` · `npm run db:studio`.
- Seed clears child tables and recreates them, so re-seed to reset demo state.
- **Migrations are the source of truth.** `prisma/migrations` reproduces the full
  schema from an empty DB (verified); prod was baselined into `_prisma_migrations`
  on 2026-07-08. Make schema changes with `prisma migrate dev` — avoid bare
  `db push` on shared/prod DBs (that caused earlier drift). Prod is **not**
  auto-migrated on deploy yet: apply new migrations with `prisma migrate deploy`
  against a **direct** connection (session mode, port 5432 — not the pooler); add a
  `directUrl` to the datasource before wiring `migrate deploy` into CI.
- **RLS is enabled on every table** (incl. internal ones) so the public Supabase
  anon key can't reach them via PostgREST; the app uses Prisma/service-role, which
  bypasses RLS. New tables must enable RLS (the baseline migration does this).

## Conventions

- **All UI copy in Dutch (NL).** Marketing copy has been reworked to be original
  (the earlier source-mirroring rewrite is done); the site is indexable.
- Colors: **blue `#1257E0` brand + mint `#00C4A7` accent on a light theme** (the
  house style — one blue across the whole app incl. the dashboard; the earlier
  indigo/violet is retired). Tailwind tokens: `brand` (blue), `violet` (now holds
  the **mint** accent, so blue→mint gradients keep working), and `navy` — a deep
  navy ink `#071A2C` for dark surfaces (sidebar/footer/auth). Set at the token
  source (`app/globals.css` `:root` + `tailwind.config.ts`), so components use
  `brand-*`/`navy-*`/shadcn tokens, never hardcoded hex. Green/amber/red are
  semantic status colors only (success/warning/danger), not brand. The redesigned
  marketing homepage carries its own scoped palette under `.hp`
  (`app/(marketing)/home.css`), matched to these same values.
- RSC by default; client components only for interactive bits. Mutations use
  **server actions**, scoped to `getActiveCompany().company.id`.
- Dashboard pages set `export const dynamic = "force-dynamic"`.
- PDFs: server route handlers (`app/api/pdf/**`) call `renderToBuffer(...)` with a
  `@react-pdf/renderer` component (`components/pdf/*`). `@react-pdf/renderer` is in
  `serverComponentsExternalPackages` in `next.config.mjs`.
- shadcn primitives in `components/ui`. `react/no-unescaped-entities` is off
  (Dutch apostrophes).

## Status

Built: landing, risk scan + PDF, auth, dashboard, AI register, document
generator, e-learning (+ certificates), governance.
Remaining: **Pricing/Stripe**, **Settings**.

## Regulatory correctness — non-negotiable

**Source of truth:** `docs/regulatory/ai-act-verbatim-reference.md` (verbatim text of Regulation (EU) 2024/1689).
**Correctness spec:** `docs/regulatory/ai-act-correctness-spec.md` (known bugs + required test cases).
Bevindingen uit de klantreis-controle van 23-08-2026: `docs/scan-findings-2026-08-23.md`.

Rules:

1. **Every risk-classification output MUST cite a specific article or annex point.**
   If a claim cannot be traced to `ai-act-verbatim-reference.md`, do not make it.
   Write "needs verification" instead. Never infer a legal conclusion from memory.

2. **False positives are the worst failure mode.**
   Over-calling risk destroys a compliance vendor's credibility faster than any missing
   feature. When the law is ambiguous, surface the ambiguity — do not resolve it upward.

3. **Accuracy beats conversion.**
   Never inflate a risk classification, an obligation, or a deadline to drive an upsell.
   Telling a customer what they do *not* need is a feature, not a lost sale.

4. **Scope: complai-eu.nl serves DUTCH SMEs.**
   No aviation content. No EASA content. No drone content. If a scan result routes into
   Annex I Section B (drones, vehicles, marine, rail), say so and stop — do not build
   sector logic here.

5. **Before changing classification logic: read the current implementation and report it.**
   Do not edit classification rules without first showing the existing code and the
   proposed diff. Small PRs. One rule at a time.