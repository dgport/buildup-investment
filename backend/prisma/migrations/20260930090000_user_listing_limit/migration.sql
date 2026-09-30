ALTER TABLE "users" ADD COLUMN "listing_limit" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "users" ADD CONSTRAINT "users_listing_limit_nonnegative" CHECK ("listing_limit" >= 0);
