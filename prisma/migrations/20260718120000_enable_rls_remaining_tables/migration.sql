-- Enable Row Level Security on the remaining tenant + PII tables that the init
-- and baseline migrations missed, so the schema reproduces the documented
-- "RLS on every table" invariant from an empty DB (see CLAUDE.md). The app talks
-- to Postgres via Prisma using the service role, which BYPASSES RLS, so enabling
-- RLS here does NOT affect the app — it only closes the public PostgREST hole for
-- the anon key (RLS on + no policy = deny-all to non-bypass roles). Enabling RLS
-- that is already enabled is a no-op, so this is safe to run against a prod DB
-- that was hotfixed out-of-band.
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_systems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scan_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "compliance_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "training_completions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;
