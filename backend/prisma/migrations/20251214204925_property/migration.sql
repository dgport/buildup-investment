-- CreateEnum
CREATE TYPE "City" AS ENUM ('BATUMI', 'TBILISI');

-- DropIndex
DROP INDEX "public"."properties_address_idx";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "city" "City",
ADD COLUMN     "location" TEXT,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "property_translations" ALTER COLUMN "address" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");
