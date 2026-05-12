CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE SCHEMA "identity";
--> statement-breakpoint
CREATE SCHEMA "inventory";
--> statement-breakpoint
CREATE SCHEMA "sales";
--> statement-breakpoint
CREATE SCHEMA "school_engine";
--> statement-breakpoint
CREATE SCHEMA "system";
--> statement-breakpoint
CREATE TYPE "identity"."actor_type" AS ENUM('guest', 'user', 'service');--> statement-breakpoint
CREATE TYPE "sales"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "sales"."payment_method" AS ENUM('cod', 'card');--> statement-breakpoint
CREATE TYPE "sales"."payment_status" AS ENUM('unpaid', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "identity"."portal_role" AS ENUM('customer', 'staff', 'school_staff');--> statement-breakpoint
CREATE TABLE "sales"."addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"label" text DEFAULT 'Home' NOT NULL,
	"full_name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"city" text NOT NULL,
	"area" text NOT NULL,
	"street" text NOT NULL,
	"building" text,
	"floor" text,
	"apartment" text,
	"notes" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."auth_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."guest_principals" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_key" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guest_principals_guest_key_unique" UNIQUE("guest_key")
);
--> statement-breakpoint
CREATE TABLE "identity"."organization_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "identity"."password_credentials" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"hash_strategy" varchar(30) DEFAULT 'bcrypt' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" varchar(40) NOT NULL,
	"token_reference" text NOT NULL,
	"display_label" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(160) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "identity"."role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "identity"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "identity"."user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"action" varchar(10) DEFAULT 'grant' NOT NULL,
	"granted_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"scope" varchar(20) DEFAULT 'global' NOT NULL,
	"organization_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" varchar(20),
	"verified_phone" boolean DEFAULT false NOT NULL,
	"portal_role" "identity"."portal_role" DEFAULT 'customer' NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "catalog"."brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"localized_name" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_description" jsonb,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"localized_name" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_description" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"parent_id" integer,
	"icon" text,
	"path" text DEFAULT '/' NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog"."collection_tags" (
	"collection_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "collection_tags_collection_id_tag_id_pk" PRIMARY KEY("collection_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "catalog"."collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"localized_title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_subtitle" jsonb,
	"hero_image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"localized_name" jsonb NOT NULL,
	"localized_description" jsonb NOT NULL,
	"localized_long_description" jsonb NOT NULL,
	"category_id" integer,
	"brand_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"reviews_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" text NOT NULL,
	"variant_key" text NOT NULL,
	"localized_label" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"strike_price" numeric(12, 2),
	"cost_price" numeric(12, 2),
	"weight_grams" integer,
	"barcode" text,
	"media_set" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "catalog"."variant_attributes" (
	"variant_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"value_text" text,
	CONSTRAINT "variant_attributes_variant_id_attribute_id_pk" PRIMARY KEY("variant_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "catalog"."variant_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"data_type" text NOT NULL,
	"unit" text,
	"localized_label" jsonb NOT NULL,
	"enum_values" jsonb,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attributes_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_attributes" (
	"product_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"value_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_attributes_product_id_attribute_id_pk" PRIMARY KEY("product_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "catalog"."product_tags" (
	"product_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"group" text NOT NULL,
	"key" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"color" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"scope" text DEFAULT 'catalog' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "school_engine"."cart_kits" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_list_id" integer NOT NULL,
	"localized_name" jsonb NOT NULL,
	"item_snapshots" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."discount_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2) DEFAULT '0',
	"start_date" timestamp,
	"end_date" timestamp,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"per_user_limit" integer DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sales"."order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"cart_kit_id" integer,
	"variant_id" integer,
	"quantity" integer NOT NULL,
	"product_name_snapshot" text,
	"product_sku_snapshot" text,
	"variant_sku_snapshot" text,
	"unit_price_snapshot" numeric(10, 2),
	"unit_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"variant_snapshot" jsonb,
	"total_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"guest_email" varchar(255),
	"status" "sales"."order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "sales"."payment_status" DEFAULT 'unpaid' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EGP' NOT NULL,
	"payment_method" "sales"."payment_method",
	"shipping_address_snapshot" jsonb,
	"tracking_number" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."review_helpful_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"voter_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog"."reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer,
	"rating" numeric(2, 1) NOT NULL,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'approved',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."inventory_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"movement_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_item_alternatives" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_item_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_list_id" integer NOT NULL,
	"variant_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"quantity_required" integer DEFAULT 1 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"localized_label" jsonb NOT NULL,
	"localized_note" jsonb,
	"match_rules" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"category_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"school_name" text NOT NULL,
	"grade" text NOT NULL,
	"academic_year" text NOT NULL,
	"governorate" text,
	"area" text,
	"school_type" text,
	"academic_system" text,
	"localized_title" jsonb NOT NULL,
	"localized_description" jsonb,
	"hero_image_url" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"access_mode" text DEFAULT 'public' NOT NULL,
	"access_code" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"category_id" integer,
	CONSTRAINT "school_lists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_parent_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer,
	"session_token" text,
	"item_selections" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"optional_inclusions" integer[] DEFAULT '{}' NOT NULL,
	"optional_exclusions" integer[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_access_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"granted_via" varchar(20) NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_access_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"child_name" text,
	"note" text,
	"parent_name" text NOT NULL,
	"parent_email" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_access_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"token" varchar(128) NOT NULL,
	"label" text,
	"max_uses" integer,
	"use_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_list_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_list_code_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system"."audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system"."server_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" varchar(50) NOT NULL,
	"user_id" integer,
	"session_id" varchar(50),
	"method" varchar(10),
	"path" text,
	"status_code" integer,
	"duration" integer,
	"level" varchar(20) DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"user_agent" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system"."search_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"locale" text NOT NULL,
	"results_count" integer NOT NULL,
	"user_id" integer,
	"session_id" text,
	"clicked_product_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system"."notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text NOT NULL,
	"body_en" text,
	"body_ar" text,
	"action_url" text,
	"type" text DEFAULT 'system' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales"."addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."password_credentials" ADD CONSTRAINT "password_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "identity"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "identity"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "identity"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_permissions" ADD CONSTRAINT "user_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "identity"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity"."user_roles" ADD CONSTRAINT "user_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" ADD CONSTRAINT "collection_tags_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "catalog"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" ADD CONSTRAINT "collection_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "catalog"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "catalog"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" ADD CONSTRAINT "variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_images" ADD CONSTRAINT "variant_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "catalog"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" ADD CONSTRAINT "cart_kits_school_list_id_school_lists_id_fk" FOREIGN KEY ("school_list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_cart_kit_id_cart_kits_id_fk" FOREIGN KEY ("cart_kit_id") REFERENCES "school_engine"."cart_kits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "catalog"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" ADD CONSTRAINT "inventory_balances_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" ADD CONSTRAINT "inventory_balances_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "inventory"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" ADD CONSTRAINT "stock_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "inventory"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" ADD CONSTRAINT "school_list_item_alternatives_list_item_id_school_list_items_id_fk" FOREIGN KEY ("list_item_id") REFERENCES "school_engine"."school_list_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" ADD CONSTRAINT "school_list_item_alternatives_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD CONSTRAINT "school_list_items_school_list_id_school_lists_id_fk" FOREIGN KEY ("school_list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD CONSTRAINT "school_list_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD CONSTRAINT "school_list_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD CONSTRAINT "school_lists_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_parent_sessions" ADD CONSTRAINT "school_list_parent_sessions_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_parent_sessions" ADD CONSTRAINT "school_list_parent_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_grants" ADD CONSTRAINT "school_list_access_grants_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_grants" ADD CONSTRAINT "school_list_access_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_tokens" ADD CONSTRAINT "school_list_access_tokens_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_tokens" ADD CONSTRAINT "school_list_access_tokens_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_code_attempts" ADD CONSTRAINT "school_list_code_attempts_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_code_attempts" ADD CONSTRAINT "school_list_code_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."audit_log" ADD CONSTRAINT "audit_log_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."search_logs" ADD CONSTRAINT "search_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_auth_accounts_provider_account" ON "identity"."auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_auth_accounts_user_id" ON "identity"."auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_guest_principals_guest_key" ON "identity"."guest_principals" USING btree ("guest_key");--> statement-breakpoint
CREATE INDEX "idx_guest_principals_guest_key" ON "identity"."guest_principals" USING btree ("guest_key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_organization_memberships_org_user" ON "identity"."organization_memberships" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_organization_memberships_user_id" ON "identity"."organization_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_organizations_code" ON "identity"."organizations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_organizations_code" ON "identity"."organizations" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_methods_user_provider" ON "identity"."payment_methods" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "identity"."payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_permissions_code" ON "identity"."permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_permissions_code" ON "identity"."permissions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_roles_code" ON "identity"."roles" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_roles_code" ON "identity"."roles" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_permissions_user_permission" ON "identity"."user_permissions" USING btree ("user_id","permission_id");--> statement-breakpoint
CREATE INDEX "idx_user_permissions_user_id" ON "identity"."user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_roles_user_role_scope_org" ON "identity"."user_roles" USING btree ("user_id","role_id","scope","organization_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_user_id" ON "identity"."user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_product_key" ON "catalog"."product_variants" USING btree ("product_id","variant_key");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_variant_product_default" ON "catalog"."product_variants" USING btree ("product_id") WHERE is_default = true;--> statement-breakpoint
CREATE INDEX "idx_variant_product" ON "catalog"."product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_variant_sku" ON "catalog"."product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_variant_attr_variant" ON "catalog"."variant_attributes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_variant_attr_text" ON "catalog"."variant_attributes" USING btree ("attribute_id","value_text");--> statement-breakpoint
CREATE INDEX "idx_variant_images_variant" ON "catalog"."variant_images" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_product_attributes_product" ON "catalog"."product_attributes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_attributes_attr" ON "catalog"."product_attributes" USING btree ("attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tags_group_key" ON "catalog"."tags" USING btree ("group","key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_review_helpful_votes_review_voter" ON "catalog"."review_helpful_votes" USING btree ("review_id","voter_key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inventory_balance" ON "inventory"."inventory_balances" USING btree ("variant_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_variant" ON "inventory"."inventory_balances" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_variant" ON "inventory"."stock_movements" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_created" ON "inventory"."stock_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_school_lists_code" ON "school_engine"."school_lists" USING btree ("access_code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_year_grade" ON "school_engine"."school_lists" USING btree ("slug","academic_year","grade");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "system"."notifications" USING btree ("user_id");