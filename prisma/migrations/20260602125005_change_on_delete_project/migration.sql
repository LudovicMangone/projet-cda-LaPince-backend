-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_projectId_fkey";

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
