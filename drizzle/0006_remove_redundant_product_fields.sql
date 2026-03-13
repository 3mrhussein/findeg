-- Migration: remove_redundant_product_fields
-- Description: Removes price, strike_price, display_meta, and is_new from catalog.products

ALTER TABLE "catalog"."products" DROP COLUMN IF EXISTS "price";
ALTER TABLE "catalog"."products" DROP COLUMN IF EXISTS "strike_price";
ALTER TABLE "catalog"."products" DROP COLUMN IF EXISTS "display_meta";
ALTER TABLE "catalog"."products" DROP COLUMN IF EXISTS "is_new";
