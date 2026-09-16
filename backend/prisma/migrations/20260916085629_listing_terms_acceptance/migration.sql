-- AlterTable
ALTER TABLE "users" ADD COLUMN     "listing_terms_accepted_at" TIMESTAMP(3),
ADD COLUMN     "listing_terms_version" TEXT;
