
-- AlterTable
ALTER TABLE "ai_systems" ADD COLUMN     "log_location" TEXT,
ADD COLUMN     "log_retention_months" INTEGER,
ADD COLUMN     "log_retention_owner" TEXT,
ADD COLUMN     "log_reviewed_at" TIMESTAMP(3);

