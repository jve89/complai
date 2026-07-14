
-- CreateTable
CREATE TABLE "corrective_actions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "ai_system_id" TEXT,
    "title" TEXT NOT NULL,
    "non_conformity" TEXT,
    "action_type" TEXT NOT NULL DEFAULT 'bring_into_conformity',
    "action_taken" TEXT,
    "informed" TEXT,
    "presents_risk" BOOLEAN NOT NULL DEFAULT false,
    "authority_informed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "identified_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "corrective_actions_company_id_idx" ON "corrective_actions"("company_id");

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrective_actions" ADD CONSTRAINT "corrective_actions_ai_system_id_fkey" FOREIGN KEY ("ai_system_id") REFERENCES "ai_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable Row Level Security (RLS) so the public Supabase anon key cannot reach
-- this table via PostgREST; the app uses Prisma/service-role which bypasses RLS.
ALTER TABLE "corrective_actions" ENABLE ROW LEVEL SECURITY;

