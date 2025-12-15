/*
  Warnings:

  - You are about to drop the column `condition` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `properties` table. All the data in the column will be lost.
  - Made the column `deal_type` on table `properties` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."properties_status_idx";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "condition",
DROP COLUMN "status",
ALTER COLUMN "deal_type" SET NOT NULL;

-- DropEnum
DROP TYPE "public"."PropertyCondition";

-- DropEnum
DROP TYPE "public"."PropertyStatus";
