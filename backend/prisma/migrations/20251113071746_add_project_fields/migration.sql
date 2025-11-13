-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "delivery_date" TIMESTAMP(3),
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "num_apartments" INTEGER,
ADD COLUMN     "num_floors" INTEGER,
ADD COLUMN     "price_from" INTEGER;
