/*
  Warnings:

  - You are about to drop the `homepage_slide_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `homepage_slides` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partner_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."homepage_slide_translations" DROP CONSTRAINT "homepage_slide_translations_slide_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."partner_translations" DROP CONSTRAINT "partner_translations_partner_id_fkey";

-- DropTable
DROP TABLE "public"."homepage_slide_translations";

-- DropTable
DROP TABLE "public"."homepage_slides";

-- DropTable
DROP TABLE "public"."partner_translations";

-- DropTable
DROP TABLE "public"."partners";
