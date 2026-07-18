-- Convert Incident.category and Incident.status from loose strings to Postgres
-- enums, PRESERVING existing rows. Prisma's generated default was a destructive
-- DROP COLUMN / ADD COLUMN (which would reset every incident's category + status
-- to the defaults); hand-edited to an in-place `ALTER COLUMN ... TYPE ... USING`
-- cast. All existing values are valid enum members (verified against prod:
-- category=fundamental_rights, status in {open,reported}), so the cast is lossless.

-- CreateEnum
CREATE TYPE "IncidentCategory" AS ENUM ('health', 'critical_infra', 'fundamental_rights', 'property_env');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('open', 'reported', 'closed');

-- AlterTable (in-place cast — keeps existing data)
ALTER TABLE "incidents"
  ALTER COLUMN "category" DROP DEFAULT,
  ALTER COLUMN "category" TYPE "IncidentCategory" USING ("category"::text::"IncidentCategory"),
  ALTER COLUMN "category" SET DEFAULT 'health';

ALTER TABLE "incidents"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "IncidentStatus" USING ("status"::text::"IncidentStatus"),
  ALTER COLUMN "status" SET DEFAULT 'open';
