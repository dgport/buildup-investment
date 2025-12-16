/*
  Warnings:

  - The values [ADJARA,TBILISI,IMERETI,KAKHETI,SAMEGRELO_ZEMO_SVANETI,KVEMO_KARTLI,SHIDA_KARTLI,MTSKHETA_MTIANETI,SAMTSKHE_JAVAKHETI,RACHA_LECHKHUMI_KVEMO_SVANETI,GURIA,SAMTSKHЕ_JAVAKHETI,ABKHAZIA] on the enum `Region` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Region_new" AS ENUM ('BATUMI', 'KOBULETI', 'CHAKVI', 'MAKHINJAURI', 'GONIO', 'UREKI');
ALTER TABLE "projects" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TABLE "region_translations" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TYPE "Region" RENAME TO "Region_old";
ALTER TYPE "Region_new" RENAME TO "Region";
DROP TYPE "public"."Region_old";
COMMIT;
