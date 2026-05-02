CREATE TYPE "identity"."actor_type" AS ENUM('system', 'user', 'api_key');--> statement-breakpoint
CREATE TYPE "public"."customer_group" AS ENUM('public_b2c', 'school_b2b', 'wholesale');--> statement-breakpoint
CREATE TYPE "sales"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "sales"."payment_method" AS ENUM('cod', 'card');--> statement-breakpoint
CREATE TYPE "sales"."payment_status" AS ENUM('unpaid', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "identity"."portal_role" AS ENUM('customer', 'staff', 'school_staff');--> statement-breakpoint
CREATE TYPE "public"."uom_code" AS ENUM('pcs', 'pack', 'carton');--> statement-breakpoint
ALTER TABLE "identity"."users" ALTER COLUMN "portal_role" SET DATA TYPE portal_role;--> statement-breakpoint
ALTER TABLE "catalog"."variant_price_lists" ALTER COLUMN "customer_group" SET DATA TYPE customer_group;--> statement-breakpoint
ALTER TABLE "catalog"."variant_price_lists" ALTER COLUMN "uom_code" SET DATA TYPE uom_code;--> statement-breakpoint
ALTER TABLE "catalog"."variant_sellable_uoms" ALTER COLUMN "uom_code" SET DATA TYPE uom_code;--> statement-breakpoint
ALTER TABLE "sales"."orders" ALTER COLUMN "status" SET DATA TYPE order_status;--> statement-breakpoint
ALTER TABLE "sales"."orders" ALTER COLUMN "payment_status" SET DATA TYPE payment_status;--> statement-breakpoint
ALTER TABLE "sales"."orders" ALTER COLUMN "payment_method" SET DATA TYPE payment_method;