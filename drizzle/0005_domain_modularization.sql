CREATE SCHEMA IF NOT EXISTS "identity";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "catalog";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "sales";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "system";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "inventory";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."users" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."auth_accounts" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."guest_principals" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."organization_memberships" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."organizations" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."password_credentials" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."payment_methods" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."permissions" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."role_permissions" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."roles" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."user_permissions" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."user_roles" SET SCHEMA "identity";
--> statement-breakpoint
ALTER TABLE "public"."brands" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."categories" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."products" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."product_variants" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."variant_attributes" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."variant_images" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."order_items" SET SCHEMA "sales";
--> statement-breakpoint
ALTER TABLE "public"."orders" SET SCHEMA "sales";
--> statement-breakpoint
ALTER TABLE "public"."review_helpful_votes" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."reviews" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."addresses" SET SCHEMA "sales";
--> statement-breakpoint
ALTER TABLE "public"."audit_log" SET SCHEMA "system";
--> statement-breakpoint
ALTER TABLE "public"."server_logs" SET SCHEMA "system";
--> statement-breakpoint
ALTER TABLE "public"."variant_price_lists" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."variant_sellable_uoms" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."product_tags" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."tags" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."attribute_definitions" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."product_attributes" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."translations" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."collection_tags" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."collections" SET SCHEMA "catalog";
--> statement-breakpoint
ALTER TABLE "public"."inventory_balances" SET SCHEMA "inventory";
--> statement-breakpoint
ALTER TABLE "public"."stock_movements" SET SCHEMA "inventory";
--> statement-breakpoint
ALTER TABLE "public"."warehouses" SET SCHEMA "inventory";
--> statement-breakpoint
ALTER TABLE "public"."discount_rules" SET SCHEMA "sales";
--> statement-breakpoint
ALTER TABLE "public"."school_list_item_alternatives" SET SCHEMA "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."school_list_items" SET SCHEMA "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."school_lists" SET SCHEMA "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."school_access" SET SCHEMA "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."school_list_sessions" SET SCHEMA "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."cart_kits" SET SCHEMA "school_engine";
--> statement-breakpoint
ALTER TABLE "public"."search_logs" SET SCHEMA "system";
--> statement-breakpoint
ALTER TABLE "public"."notifications" SET SCHEMA "system";