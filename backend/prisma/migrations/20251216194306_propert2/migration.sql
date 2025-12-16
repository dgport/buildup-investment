/*
  Warnings:

  - You are about to drop the column `city` on the `properties` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."properties_city_idx";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "city";

-- DropEnum
DROP TYPE "public"."City";
