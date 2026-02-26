CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" text,
	"last_name" text,
	"name" text,
	"phone" varchar(20),
	"password" text,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_principals" (
	"id" serial PRIMARY KEY NOT NULL,
	"guest_key" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guest_principals_guest_key_unique" UNIQUE("guest_key")
);
--> statement-breakpoint
CREATE TABLE "organization_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "password_credentials" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"hash_strategy" varchar(30) DEFAULT 'bcrypt' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
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
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(160) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(120) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"scope" varchar(20) DEFAULT 'global' NOT NULL,
	"organization_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"localized_name" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_slug" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"localized_slug" jsonb DEFAULT '{}'::jsonb NOT NULL,
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
CREATE TABLE "category_translations" (
	"category_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_translations_category_id_language_pk" PRIMARY KEY("category_id","language")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"product_id" integer NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_translations_product_id_language_pk" PRIMARY KEY("product_id","language")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" text,
	"localized_slug" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_name" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_description" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"localized_long_description" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"strike_price" numeric(10, 2),
	"category_id" integer,
	"brand_id" integer,
	"images" jsonb DEFAULT '[]'::jsonb,
	"media_set" jsonb DEFAULT '{}'::jsonb,
	"pricing" jsonb,
	"discount_rules" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"is_new" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0',
	"reviews_count" integer DEFAULT 0,
	"variants" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"quantity" integer NOT NULL,
	"product_name_snapshot" text,
	"product_sku_snapshot" text,
	"unit_price_snapshot" numeric(10, 2),
	"variant_snapshot" jsonb,
	"total_price" numeric(10, 2),
	"price_at_time" numeric(10, 2) NOT NULL,
	"variant_details" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"guest_email" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'unpaid' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EGP' NOT NULL,
	"payment_method" varchar(50),
	"shipping_address_snapshot" jsonb,
	"tracking_number" text,
	"admin_notes" text,
	"shipping_address" text,
	"billing_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer,
	"rating" numeric(2, 1) NOT NULL,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false,
	"status" text DEFAULT 'approved',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"label" text DEFAULT 'Home' NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
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
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "server_logs" (
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
CREATE TABLE "variant_price_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"variant_key" text NOT NULL,
	"customer_group" text NOT NULL,
	"uom_code" text NOT NULL,
	"currency" text DEFAULT 'EGP' NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"is_sellable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variant_sellable_uoms" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"variant_key" text NOT NULL,
	"uom_code" text NOT NULL,
	"factor_to_base" numeric(12, 4) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"key" text NOT NULL,
	"language" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "translations_key_language_pk" PRIMARY KEY("key","language")
);
--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_credentials" ADD CONSTRAINT "password_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_price_lists" ADD CONSTRAINT "variant_price_lists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" ADD CONSTRAINT "variant_sellable_uoms_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_auth_accounts_provider_account" ON "auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_auth_accounts_user_id" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_guest_principals_guest_key" ON "guest_principals" USING btree ("guest_key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_organization_memberships_org_user" ON "organization_memberships" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_organization_memberships_user_id" ON "organization_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_organizations_code" ON "organizations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_permissions_code" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_roles_code" ON "roles" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_roles_user_role_scope_org" ON "user_roles" USING btree ("user_id","role_id","scope","organization_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_user_id" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_price_lists_variant_group_uom" ON "variant_price_lists" USING btree ("product_id","variant_key","customer_group","uom_code");--> statement-breakpoint
CREATE INDEX "idx_variant_price_lists_product_id" ON "variant_price_lists" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_variant_price_lists_customer_group" ON "variant_price_lists" USING btree ("customer_group");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_sellable_uoms_variant_uom" ON "variant_sellable_uoms" USING btree ("product_id","variant_key","uom_code");--> statement-breakpoint
CREATE INDEX "idx_variant_sellable_uoms_product_id" ON "variant_sellable_uoms" USING btree ("product_id");