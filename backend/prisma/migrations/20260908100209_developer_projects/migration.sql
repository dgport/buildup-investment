-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'UNDER_CONSTRUCTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UnitAvailability" AS ENUM ('AVAILABLE', 'LIMITED', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "developers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "founded_year" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_translations" (
    "id" SERIAL NOT NULL,
    "developer_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "developer_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "developer_id" TEXT NOT NULL,
    "region" "Region",
    "address" TEXT,
    "location" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'UNDER_CONSTRUCTION',
    "progress" INTEGER,
    "delivery_quarter" INTEGER,
    "delivery_year" INTEGER,
    "floors" INTEGER,
    "total_apartments" INTEGER,
    "price_per_sqm_from" INTEGER,
    "price_from" INTEGER,
    "hot_sale" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "video_url" TEXT,
    "tour_url" TEXT,
    "installment_available" BOOLEAN NOT NULL DEFAULT false,
    "down_payment_percent" INTEGER,
    "installment_months" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_translations" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,

    CONSTRAINT "project_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" SERIAL NOT NULL,
    "project_id" TEXT NOT NULL,
    "unit_type_id" TEXT,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_unit_types" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "area_from" DOUBLE PRECISION NOT NULL,
    "area_to" DOUBLE PRECISION,
    "price_per_sqm" INTEGER,
    "price_from" INTEGER,
    "floors_from" INTEGER,
    "floors_to" INTEGER,
    "available_count" INTEGER,
    "availability" "UnitAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_unit_type_translations" (
    "id" SERIAL NOT NULL,
    "unit_type_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "project_unit_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_leads" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "unit_type_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ka',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "note" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developers_slug_key" ON "developers"("slug");

-- CreateIndex
CREATE INDEX "developers_published_idx" ON "developers"("published");

-- CreateIndex
CREATE UNIQUE INDEX "developer_translations_developer_id_language_key" ON "developer_translations"("developer_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_developer_id_idx" ON "projects"("developer_id");

-- CreateIndex
CREATE INDEX "projects_region_idx" ON "projects"("region");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_published_idx" ON "projects"("published");

-- CreateIndex
CREATE INDEX "projects_hot_sale_idx" ON "projects"("hot_sale");

-- CreateIndex
CREATE INDEX "projects_price_per_sqm_from_idx" ON "projects"("price_per_sqm_from");

-- CreateIndex
CREATE INDEX "projects_delivery_year_idx" ON "projects"("delivery_year");

-- CreateIndex
CREATE UNIQUE INDEX "project_translations_project_id_language_key" ON "project_translations"("project_id", "language");

-- CreateIndex
CREATE INDEX "project_images_project_id_idx" ON "project_images"("project_id");

-- CreateIndex
CREATE INDEX "project_images_unit_type_id_idx" ON "project_images"("unit_type_id");

-- CreateIndex
CREATE INDEX "project_unit_types_project_id_idx" ON "project_unit_types"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_unit_type_translations_unit_type_id_language_key" ON "project_unit_type_translations"("unit_type_id", "language");

-- CreateIndex
CREATE INDEX "project_leads_project_id_idx" ON "project_leads"("project_id");

-- CreateIndex
CREATE INDEX "project_leads_status_idx" ON "project_leads"("status");

-- CreateIndex
CREATE INDEX "project_leads_created_at_idx" ON "project_leads"("created_at");

-- AddForeignKey
ALTER TABLE "developer_translations" ADD CONSTRAINT "developer_translations_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "project_unit_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_unit_types" ADD CONSTRAINT "project_unit_types_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_unit_type_translations" ADD CONSTRAINT "project_unit_type_translations_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "project_unit_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_leads" ADD CONSTRAINT "project_leads_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
