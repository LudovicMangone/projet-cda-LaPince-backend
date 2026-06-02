/*
  Warnings:

  - The `type` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "project_type" AS ENUM ('Voyage', 'Maison / Coloc', 'Anniversaire', 'Repas / Sortie', 'Pro / Travail', 'Autre');

-- AlterTable
ALTER TABLE "project" DROP COLUMN "type",
ADD COLUMN     "type" "project_type" NOT NULL DEFAULT 'Voyage';
