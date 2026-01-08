/*
  Warnings:

  - You are about to drop the `apartment_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `apartments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mortgage_rates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_translations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."apartment_translations" DROP CONSTRAINT "apartment_translations_apartment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."apartments" DROP CONSTRAINT "apartments_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."project_translations" DROP CONSTRAINT "project_translations_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."projects" DROP CONSTRAINT "projects_partner_id_fkey";

-- DropTable
DROP TABLE "public"."apartment_translations";

-- DropTable
DROP TABLE "public"."apartments";

-- DropTable
DROP TABLE "public"."mortgage_rates";

-- DropTable
DROP TABLE "public"."project_translations";

-- DropTable
DROP TABLE "public"."projects";
