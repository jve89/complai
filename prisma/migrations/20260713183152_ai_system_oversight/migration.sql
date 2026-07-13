
-- AlterTable
ALTER TABLE "ai_systems" ADD COLUMN     "oversight_employee_id" TEXT;

-- AddForeignKey
ALTER TABLE "ai_systems" ADD CONSTRAINT "ai_systems_oversight_employee_id_fkey" FOREIGN KEY ("oversight_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

