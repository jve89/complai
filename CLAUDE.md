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

- **All UI copy in Dutch (NL).** Marketing copy currently mirrors a source site —
  flagged for an original-copy rewrite before launch (avoid plagiarism).
- Colors: **indigo `#6366f1` / violet `#8b5cf6` brand on a light theme.** Tailwind
  tokens: `brand` (indigo), `violet`, and `navy` — note `navy` is now a deep
  indigo ink `#1e1b4b` for dark surfaces (sidebar/footer/auth), not slate-navy.
  Green/amber/red are semantic status colors only (success/warning/danger), not
  brand. Marketing pages are light; the hero is a light section with an
  indigo→violet gradient headline.
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
