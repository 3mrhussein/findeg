ALTER TABLE "catalog"."variant_price_lists" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "catalog"."variant_sellable_uoms" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "catalog"."variant_price_lists" CASCADE;--> statement-breakpoint
DROP TABLE "catalog"."variant_sellable_uoms" CASCADE;--> statement-breakpoint
ALTER TABLE "catalog"."attribute_definitions" RENAME TO "attributes";--> statement-breakpoint
ALTER TABLE "catalog"."products" RENAME COLUMN "localized_slug" TO "slug";--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" RENAME COLUMN "display_order" TO "sort_order";--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP CONSTRAINT "products_sku_unique";--> statement-breakpoint
ALTER TABLE "catalog"."attributes" DROP CONSTRAINT "attribute_definitions_key_unique";--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" DROP CONSTRAINT "variant_attributes_attribute_id_attribute_definitions_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" DROP CONSTRAINT "product_attributes_attribute_id_attribute_definitions_id_fk";
--> statement-breakpoint
DROP INDEX "catalog"."idx_variant_attr_num";--> statement-breakpoint
ALTER TABLE "catalog"."products" ALTER COLUMN "localized_name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "catalog"."products" ALTER COLUMN "localized_description" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "catalog"."products" ALTER COLUMN "localized_long_description" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" ADD COLUMN "media_set" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_variant_product_default" ON "catalog"."product_variants" USING btree ("product_id") WHERE is_default = true;--> statement-breakpoint
ALTER TABLE "catalog"."brands" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP COLUMN "sku_prefix";--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP COLUMN "media_set";--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" DROP COLUMN "low_stock_threshold";--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" DROP COLUMN "value_num";--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" DROP COLUMN "value_bool";--> statement-breakpoint
ALTER TABLE "catalog"."attributes" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "catalog"."attributes" DROP COLUMN "is_variant_defining";--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" DROP COLUMN "value_num";--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" DROP COLUMN "value_bool";--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP COLUMN "uom_code";--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP COLUMN "uom_factor";--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "catalog"."attributes" ADD CONSTRAINT "attributes_key_unique" UNIQUE("key");--> statement-breakpoint
DROP TYPE "identity"."actor_type";--> statement-breakpoint
CREATE TYPE "identity"."actor_type" AS ENUM('guest', 'user', 'service');--> statement-breakpoint
DROP TYPE "public"."customer_group";--> statement-breakpoint
DROP TYPE "public"."uom_code";