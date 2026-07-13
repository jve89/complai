
-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "ai_system_id" TEXT,
    "complainant" TEXT,
    "channel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "received_at" TIMESTAMP(3) NOT NULL,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "complaints_company_id_idx" ON "complaints"("company_id");

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_ai_system_id_fkey" FOREIGN KEY ("ai_system_id") REFERENCES "ai_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable Row Level Security (RLS) so the public Supabase anon key cannot reach
-- this table via PostgREST; the app uses Prisma/service-role which bypasses RLS.
ALTER TABLE "complaints" ENABLE ROW LEVEL SECURITY;

