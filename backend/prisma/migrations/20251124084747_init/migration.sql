-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'COMMERCIAL', 'LAND', 'HOTEL');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('RENT', 'SALE', 'DAILY_RENT');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('OLD_BUILDING', 'NEW_BUILDING', 'UNDER_CONSTRUCTION');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('NEWLY_RENOVATED', 'OLD_RENOVATED', 'REPAIRING');

-- CreateEnum
CREATE TYPE "HeatingType" AS ENUM ('CENTRAL_HEATING', 'INDIVIDUAL', 'GAS', 'ELECTRIC', 'NONE');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('PARKING_SPACE', 'GARAGE', 'OPEN_LOT', 'NONE');

-- CreateEnum
CREATE TYPE "HotWaterType" AS ENUM ('CENTRAL_HEATING', 'BOILER', 'SOLAR', 'NONE');

-- CreateEnum
CREATE TYPE "Occupancy" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN_PLUS');

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_location" TEXT NOT NULL,
    "image" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price_from" INTEGER,
    "delivery_date" TIMESTAMP(3),
    "num_floors" INTEGER,
    "num_apartments" INTEGER,
    "hot_sale" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partner_id" INTEGER NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartments" (
    "id" SERIAL NOT NULL,
    "room" INTEGER NOT NULL,
    "area" INTEGER NOT NULL,
    "images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_translations" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,

    CONSTRAINT "partner_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_translations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_location" TEXT NOT NULL,

    CONSTRAINT "project_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartment_translations" (
    "id" SERIAL NOT NULL,
    "apartment_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "apartment_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL,
    "address" TEXT NOT NULL,
    "price" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_area" INTEGER,
    "rooms" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floors" INTEGER,
    "floors_total" INTEGER,
    "ceiling_height" DOUBLE PRECISION,
    "condition" "PropertyCondition",
    "is_non_standard" BOOLEAN NOT NULL DEFAULT false,
    "occupancy" "Occupancy",
    "heating" "HeatingType",
    "hot_water" "HotWaterType",
    "parking" "ParkingType",
    "has_conditioner" BOOLEAN NOT NULL DEFAULT false,
    "has_furniture" BOOLEAN NOT NULL DEFAULT false,
    "has_bed" BOOLEAN NOT NULL DEFAULT false,
    "has_sofa" BOOLEAN NOT NULL DEFAULT false,
    "has_table" BOOLEAN NOT NULL DEFAULT false,
    "has_chairs" BOOLEAN NOT NULL DEFAULT false,
    "has_stove" BOOLEAN NOT NULL DEFAULT false,
    "has_refrigerator" BOOLEAN NOT NULL DEFAULT false,
    "has_oven" BOOLEAN NOT NULL DEFAULT false,
    "has_washing_machine" BOOLEAN NOT NULL DEFAULT false,
    "has_kitchen_appliances" BOOLEAN NOT NULL DEFAULT false,
    "has_balcony" BOOLEAN NOT NULL DEFAULT false,
    "balcony_area" DOUBLE PRECISION,
    "has_natural_gas" BOOLEAN NOT NULL DEFAULT false,
    "has_internet" BOOLEAN NOT NULL DEFAULT false,
    "has_tv" BOOLEAN NOT NULL DEFAULT false,
    "has_sewerage" BOOLEAN NOT NULL DEFAULT false,
    "is_fenced" BOOLEAN NOT NULL DEFAULT false,
    "has_yard_lighting" BOOLEAN NOT NULL DEFAULT false,
    "has_grill" BOOLEAN NOT NULL DEFAULT false,
    "has_alarm" BOOLEAN NOT NULL DEFAULT false,
    "has_ventilation" BOOLEAN NOT NULL DEFAULT false,
    "has_water" BOOLEAN NOT NULL DEFAULT false,
    "has_electricity" BOOLEAN NOT NULL DEFAULT false,
    "has_gate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_translations" (
    "id" SERIAL NOT NULL,
    "property_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "property_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_gallery_images" (
    "id" SERIAL NOT NULL,
    "property_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_company_name_key" ON "partners"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_project_name_key" ON "projects"("project_name");

-- CreateIndex
CREATE UNIQUE INDEX "partner_translations_partner_id_language_key" ON "partner_translations"("partner_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "project_translations_project_id_language_key" ON "project_translations"("project_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "apartment_translations_apartment_id_language_key" ON "apartment_translations"("apartment_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "properties_external_id_key" ON "properties"("external_id");

-- CreateIndex
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "property_translations_property_id_idx" ON "property_translations"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_translations_property_id_language_key" ON "property_translations"("property_id", "language");

-- CreateIndex
CREATE INDEX "property_gallery_images_property_id_idx" ON "property_gallery_images"("property_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_translations" ADD CONSTRAINT "partner_translations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartment_translations" ADD CONSTRAINT "apartment_translations_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_translations" ADD CONSTRAINT "property_translations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_gallery_images" ADD CONSTRAINT "property_gallery_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
