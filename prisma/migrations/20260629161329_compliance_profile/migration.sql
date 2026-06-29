-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "entity_roles" TEXT[],
ADD COLUMN     "plan" TEXT,
ADD COLUMN     "profile_json" JSONB,
ADD COLUMN     "risk_tiers" TEXT[];

-- AlterTable
ALTER TABLE "compliance_items" ADD COLUMN     "code" TEXT,
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "scan_results" ADD COLUMN     "profile" JSONB;
