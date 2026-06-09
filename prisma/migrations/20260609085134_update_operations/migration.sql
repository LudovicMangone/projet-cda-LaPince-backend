/*
  Warnings:

  - You are about to drop the column `isAmoutCalculated` on the `operation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "operation" DROP COLUMN "isAmoutCalculated",
ADD COLUMN     "isAmountCalculated" BOOLEAN NOT NULL DEFAULT true;
