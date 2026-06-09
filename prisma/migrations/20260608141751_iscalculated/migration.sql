-- AlterTable
ALTER TABLE "operation" ADD COLUMN     "isAmoutCalculated" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "operation_participant" ADD COLUMN     "isRepartitionAmountCalculated" BOOLEAN NOT NULL DEFAULT true;
