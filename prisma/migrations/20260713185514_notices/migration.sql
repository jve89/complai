
-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ai_system_id" TEXT,
    "recipient" TEXT NOT NULL,
    "method" TEXT,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notices_company_id_idx" ON "notices"("company_id");

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_ai_system_id_fkey" FOREIGN KEY ("ai_system_id") REFERENCES "ai_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable Row Level Security (RLS) so the public Supabase anon key cannot reach
-- this table via PostgREST; the app uses Prisma/service-role which bypasses RLS.
ALTER TABLE "notices" ENABLE ROW LEVEL SECURITY;

