
-- CreateTable
CREATE TABLE "conformity_assessments" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "ai_system_id" TEXT NOT NULL,
    "route" TEXT NOT NULL DEFAULT 'internal',
    "steps" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conformity_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conformity_assessments_ai_system_id_key" ON "conformity_assessments"("ai_system_id");

-- CreateIndex
CREATE INDEX "conformity_assessments_company_id_idx" ON "conformity_assessments"("company_id");

-- AddForeignKey
ALTER TABLE "conformity_assessments" ADD CONSTRAINT "conformity_assessments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conformity_assessments" ADD CONSTRAINT "conformity_assessments_ai_system_id_fkey" FOREIGN KEY ("ai_system_id") REFERENCES "ai_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security (RLS) so the public Supabase anon key cannot reach
-- this table via PostgREST; the app uses Prisma/service-role which bypasses RLS.
ALTER TABLE "conformity_assessments" ENABLE ROW LEVEL SECURITY;

