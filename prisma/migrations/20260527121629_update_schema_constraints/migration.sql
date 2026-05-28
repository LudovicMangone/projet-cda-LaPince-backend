-- DropForeignKey
ALTER TABLE "alert" DROP CONSTRAINT "alert_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "app_user_alert" DROP CONSTRAINT "app_user_alert_alertId_fkey";

-- DropForeignKey
ALTER TABLE "app_user_alert" DROP CONSTRAINT "app_user_alert_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "budget" DROP CONSTRAINT "budget_projectId_fkey";

-- DropForeignKey
ALTER TABLE "operation" DROP CONSTRAINT "operation_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "operation_participant" DROP CONSTRAINT "operation_participant_operationId_fkey";

-- DropForeignKey
ALTER TABLE "operation_participant" DROP CONSTRAINT "operation_participant_participantId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_appUserId_fkey";

-- DropForeignKey
ALTER TABLE "project_participant" DROP CONSTRAINT "project_participant_participantId_fkey";

-- DropForeignKey
ALTER TABLE "project_participant" DROP CONSTRAINT "project_participant_projectId_fkey";

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user_alert" ADD CONSTRAINT "app_user_alert_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user_alert" ADD CONSTRAINT "app_user_alert_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_participant" ADD CONSTRAINT "project_participant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_participant" ADD CONSTRAINT "project_participant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_participant" ADD CONSTRAINT "operation_participant_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_participant" ADD CONSTRAINT "operation_participant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
