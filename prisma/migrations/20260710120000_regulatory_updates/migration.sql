-- CreateTable
CREATE TABLE "regulatory_updates" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detail" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT NOT NULL,
    "source_label" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "affects_everyone" BOOLEAN NOT NULL DEFAULT false,
    "affects_high_risk" BOOLEAN NOT NULL DEFAULT false,
    "affects_prohibited" BOOLEAN NOT NULL DEFAULT false,
    "affects_limited" BOOLEAN NOT NULL DEFAULT false,
    "affects_provider" BOOLEAN NOT NULL DEFAULT false,
    "product_impact" TEXT,
    "recert" TEXT,
    "added_at" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regulatory_updates_status_idx" ON "regulatory_updates"("status");

-- Secure this internal table (mirrors the baseline migration): the app reaches
-- it only via Prisma/service-role, which bypasses RLS, so enabling RLS closes
-- the public PostgREST hole without affecting the app.
ALTER TABLE "regulatory_updates" ENABLE ROW LEVEL SECURITY;
