# ComplAI

EU AI Act compliance SaaS for Dutch organisations: risk scan → AI register →
document generation → e-learning → governance, behind Supabase auth with Stripe
billing.

## Stack

- **Next.js 14** (App Router, RSC) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** — navy `#0f172a` / emerald `#10b981` theme
- **Supabase** (auth) + **Prisma** (schema/migrations over Supabase Postgres)
- **@react-pdf/renderer** (PDF generation)
- **Stripe** (billing) + **Resend** (transactional email) — both stub gracefully
  when keys are absent

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Start the local database + auth (Supabase CLI)

The local Supabase stack provides Postgres **and** email/password auth with no
cloud account. Install the CLI (`brew install supabase/tap/supabase`), then:

```bash
supabase start          # prints local URL, anon key and DB connection string
```

Copy the printed `anon key`, `service_role key` and API URL into `.env`. The
default `DATABASE_URL` in `.env.example` already matches the local stack.

> No Supabase CLI? Any local Postgres works for Prisma; you then point
> `NEXT_PUBLIC_SUPABASE_URL`/keys at a Supabase Cloud project for auth.

### 4. Apply the schema and seed demo data

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Demo data: 1 company, an admin user, 3 AI systems, a sample scan result and
compliance items.

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/            App Router routes (marketing, scan, auth, dashboard, api)
components/     Shared components + shadcn primitives (components/ui)
lib/            supabase clients, prisma, stripe/resend (stubbable), scan scoring
prisma/         schema.prisma + seed.ts
middleware.ts   Route protection for /dashboard/*
```

## Notes

- Stripe and Resend run in **stub mode** without keys: checkout/portal return a
  friendly message and emails are logged to the console. Add keys to `.env` to
  go live.
- Scan scoring and Annex III risk classification use documented heuristic
  defaults that can be refined.
