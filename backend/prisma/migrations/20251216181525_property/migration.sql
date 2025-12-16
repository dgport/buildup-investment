-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "region" "Region";

-- CreateIndex
CREATE INDEX "properties_region_idx" ON "properties"("region");

-- CreateIndex
CREATE INDEX "properties_location_idx" ON "properties"("location");
