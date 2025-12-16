/*
  Warnings:

  - You are about to drop the column `project_location` on the `project_translations` table. All the data in the column will be lost.
  - You are about to drop the column `project_location` on the `projects` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Region" AS ENUM ('ADJARA', 'TBILISI', 'IMERETI', 'KAKHETI', 'SAMEGRELO_ZEMO_SVANETI', 'KVEMO_KARTLI', 'SHIDA_KARTLI', 'MTSKHETA_MTIANETI', 'SAMTSKHE_JAVAKHETI', 'RACHA_LECHKHUMI_KVEMO_SVANETI', 'GURIA', 'SAMTSKHЕ_JAVAKHETI', 'ABKHAZIA');

-- DropIndex
DROP INDEX "public"."projects_project_name_key";

-- AlterTable
ALTER TABLE "project_translations" DROP COLUMN "project_location",
ADD COLUMN     "street" TEXT;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "project_location",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "region" "Region",
ADD COLUMN     "street" TEXT;

-- CreateTable
CREATE TABLE "region_translations" (
    "id" SERIAL NOT NULL,
    "region" "Region" NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "region_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "region_translations_region_language_key" ON "region_translations"("region", "language");

-- CreateIndex
CREATE INDEX "projects_region_idx" ON "projects"("region");

-- CreateIndex
CREATE INDEX "projects_location_idx" ON "projects"("location");
