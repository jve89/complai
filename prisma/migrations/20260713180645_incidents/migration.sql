
-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'health',
    "involves_death" BOOLEAN NOT NULL DEFAULT false,
    "widespread" BOOLEAN NOT NULL DEFAULT false,
    "aware_at" TIMESTAMP(3) NOT NULL,
    "occurred_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "reported_at" TIMESTAMP(3),
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incidents_company_id_idx" ON "incidents"("company_id");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Secure this internal table (mirrors the baseline migration): the app reaches
-- it only via Prisma/service-role, which bypasses RLS, so enabling RLS closes the
-- public PostgREST hole without affecting the app.
ALTER TABLE "incidents" ENABLE ROW LEVEL SECURITY;

