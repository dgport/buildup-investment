/*
  Warnings:

  - You are about to drop the column `propertyType` on the `properties` table. All the data in the column will be lost.
  - Added the required column `property_type` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `property_translations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."properties_propertyType_idx";

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "propertyType",
ADD COLUMN     "deal_type" "DealType",
ADD COLUMN     "hot_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "property_type" "PropertyType" NOT NULL,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "property_translations" ADD COLUMN     "address" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "properties_property_type_idx" ON "properties"("property_type");

-- CreateIndex
CREATE INDEX "properties_price_idx" ON "properties"("price");

-- CreateIndex
CREATE INDEX "properties_address_idx" ON "properties"("address");

-- CreateIndex
CREATE INDEX "properties_deal_type_idx" ON "properties"("deal_type");

-- CreateIndex
CREATE INDEX "properties_hot_sale_idx" ON "properties"("hot_sale");

-- CreateIndex
CREATE INDEX "properties_public_idx" ON "properties"("public");

-- CreateIndex
CREATE INDEX "property_translations_language_idx" ON "property_translations"("language");
