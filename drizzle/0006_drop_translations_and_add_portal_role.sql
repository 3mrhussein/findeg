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
ALTER TABLE "category_translations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_translations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "catalog"."translations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "category_translations" CASCADE;--> statement-breakpoint
DROP TABLE "product_translations" CASCADE;--> statement-breakpoint
DROP TABLE "catalog"."translations" CASCADE;--> statement-breakpoint
ALTER TABLE "identity"."auth_accounts" DROP CONSTRAINT "auth_accounts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."organization_memberships" DROP CONSTRAINT "organization_memberships_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."organization_memberships" DROP CONSTRAINT "organization_memberships_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."password_credentials" DROP CONSTRAINT "password_credentials_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."payment_methods" DROP CONSTRAINT "payment_methods_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" DROP CONSTRAINT "role_permissions_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."role_permissions" DROP CONSTRAINT "role_permissions_permission_id_permissions_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."user_permissions" DROP CONSTRAINT "user_permissions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."user_permissions" DROP CONSTRAINT "user_permissions_permission_id_permissions_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."user_permissions" DROP CONSTRAINT "user_permissions_granted_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."user_roles" DROP CONSTRAINT "user_roles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."user_roles" DROP CONSTRAINT "user_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "identity"."user_roles" DROP CONSTRAINT "user_roles_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP CONSTRAINT "products_brand_id_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" DROP CONSTRAINT "product_variants_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" DROP CONSTRAINT "variant_attributes_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" DROP CONSTRAINT "variant_attributes_attribute_id_attribute_definitions_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."variant_images" DROP CONSTRAINT "variant_images_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP CONSTRAINT "order_items_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP CONSTRAINT "order_items_cart_kit_id_cart_kits_id_fk";
--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP CONSTRAINT "order_items_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "sales"."orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."review_helpful_votes" DROP CONSTRAINT "review_helpful_votes_review_id_reviews_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."reviews" DROP CONSTRAINT "reviews_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."reviews" DROP CONSTRAINT "reviews_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sales"."addresses" DROP CONSTRAINT "addresses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "system"."audit_log" DROP CONSTRAINT "audit_log_admin_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."variant_price_lists" DROP CONSTRAINT "variant_price_lists_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."variant_sellable_uoms" DROP CONSTRAINT "variant_sellable_uoms_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" DROP CONSTRAINT "product_tags_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" DROP CONSTRAINT "product_tags_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" DROP CONSTRAINT "product_attributes_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" DROP CONSTRAINT "product_attributes_attribute_id_attribute_definitions_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" DROP CONSTRAINT "collection_tags_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" DROP CONSTRAINT "collection_tags_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" DROP CONSTRAINT "inventory_balances_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" DROP CONSTRAINT "inventory_balances_warehouse_id_warehouses_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" DROP CONSTRAINT "stock_movements_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" DROP CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" DROP CONSTRAINT "stock_movements_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" DROP CONSTRAINT "school_list_item_alternatives_list_item_id_school_list_items_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" DROP CONSTRAINT "school_list_item_alternatives_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" DROP CONSTRAINT "school_list_items_school_list_id_school_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" DROP CONSTRAINT "school_list_items_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_grants" DROP CONSTRAINT "school_list_access_grants_list_id_school_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_grants" DROP CONSTRAINT "school_list_access_grants_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" DROP CONSTRAINT "school_list_access_requests_list_id_school_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" DROP CONSTRAINT "school_list_access_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" DROP CONSTRAINT "school_list_access_requests_reviewed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_tokens" DROP CONSTRAINT "school_list_access_tokens_list_id_school_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_tokens" DROP CONSTRAINT "school_list_access_tokens_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_code_attempts" DROP CONSTRAINT "school_list_code_attempts_list_id_school_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_code_attempts" DROP CONSTRAINT "school_list_code_attempts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_parent_sessions" DROP CONSTRAINT "school_list_parent_sessions_list_id_school_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_parent_sessions" DROP CONSTRAINT "school_list_parent_sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP CONSTRAINT "cart_kits_parent_session_id_school_list_parent_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP CONSTRAINT "cart_kits_school_list_id_school_lists_id_fk";
--> statement-breakpoint
DROP INDEX "catalog"."idx_product_tags_product";--> statement-breakpoint
DROP INDEX "catalog"."idx_product_tags_tag";--> statement-breakpoint
DROP INDEX "catalog"."idx_product_attributes_text";--> statement-breakpoint
DROP INDEX "catalog"."idx_product_attributes_num";--> statement-breakpoint
DROP INDEX "sales"."idx_discount_rules_scope";--> statement-breakpoint
DROP INDEX "sales"."idx_discount_rules_active";--> statement-breakpoint
DROP INDEX "sales"."idx_discount_rules_group";--> statement-breakpoint
DROP INDEX "school_engine"."uq_school_alternative";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_alternatives_item";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_alternatives_variant";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_list_items_list";--> statement-breakpoint
DROP INDEX "school_engine"."uq_school_access_grant";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_grant_user";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_grant_list";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_request_user";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_request_list";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_request_status";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_token_list";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_access_token_str";--> statement-breakpoint
DROP INDEX "school_engine"."uq_school_code_attempt";--> statement-breakpoint
DROP INDEX "school_engine"."uq_school_parent_user_session";--> statement-breakpoint
DROP INDEX "school_engine"."uq_school_parent_guest_session";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_parent_session_user";--> statement-breakpoint
DROP INDEX "school_engine"."idx_school_parent_session_token";--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" DROP CONSTRAINT "product_tags_product_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" DROP CONSTRAINT "collection_tags_collection_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "sales"."order_items" ALTER COLUMN "total_price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sales"."order_items" ALTER COLUMN "total_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."addresses" ALTER COLUMN "phone" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "catalog"."tags" ALTER COLUMN "scope" SET DEFAULT 'catalog';--> statement-breakpoint
ALTER TABLE "catalog"."collections" ALTER COLUMN "localized_title" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ALTER COLUMN "value" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "identity"."users" ADD COLUMN "portal_role" varchar(20) DEFAULT 'customer';--> statement-breakpoint
ALTER TABLE "catalog"."brands" ADD COLUMN "localized_description" jsonb;--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD COLUMN "unit_price" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD COLUMN "total_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "system"."audit_log" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "system"."audit_log" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "catalog"."tags" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog"."attribute_definitions" ADD COLUMN "is_variant_defining" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog"."attribute_definitions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "min_order_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "usage_limit" integer;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "usage_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" ADD COLUMN "per_user_limit" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD COLUMN "variant_id" integer;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD COLUMN "is_optional" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD COLUMN "localized_note" jsonb;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD COLUMN "governorate" text;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD COLUMN "area" text;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD COLUMN "school_type" text;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD COLUMN "academic_system" text;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" ADD COLUMN "localized_name" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" ADD COLUMN "item_snapshots" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "system"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "system"."notifications" USING btree ("user_id");--> statement-breakpoint
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
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "catalog"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" ADD CONSTRAINT "variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_attribute_definitions_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_images" ADD CONSTRAINT "variant_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_cart_kit_id_cart_kits_id_fk" FOREIGN KEY ("cart_kit_id") REFERENCES "school_engine"."cart_kits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "catalog"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."audit_log" ADD CONSTRAINT "audit_log_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_price_lists" ADD CONSTRAINT "variant_price_lists_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."variant_sellable_uoms" ADD CONSTRAINT "variant_sellable_uoms_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "catalog"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "catalog"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_attribute_definitions_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "catalog"."attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" ADD CONSTRAINT "collection_tags_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "catalog"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog"."collection_tags" ADD CONSTRAINT "collection_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "catalog"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" ADD CONSTRAINT "inventory_balances_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" ADD CONSTRAINT "inventory_balances_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "inventory"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" ADD CONSTRAINT "stock_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "inventory"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" ADD CONSTRAINT "school_list_item_alternatives_list_item_id_school_list_items_id_fk" FOREIGN KEY ("list_item_id") REFERENCES "school_engine"."school_list_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_item_alternatives" ADD CONSTRAINT "school_list_item_alternatives_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD CONSTRAINT "school_list_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD CONSTRAINT "school_list_items_school_list_id_school_lists_id_fk" FOREIGN KEY ("school_list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_items" ADD CONSTRAINT "school_list_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_lists" ADD CONSTRAINT "school_lists_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "catalog"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_grants" ADD CONSTRAINT "school_list_access_grants_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_grants" ADD CONSTRAINT "school_list_access_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_requests" ADD CONSTRAINT "school_list_access_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_tokens" ADD CONSTRAINT "school_list_access_tokens_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_access_tokens" ADD CONSTRAINT "school_list_access_tokens_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_code_attempts" ADD CONSTRAINT "school_list_code_attempts_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_code_attempts" ADD CONSTRAINT "school_list_code_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_parent_sessions" ADD CONSTRAINT "school_list_parent_sessions_list_id_school_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."school_list_parent_sessions" ADD CONSTRAINT "school_list_parent_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" ADD CONSTRAINT "cart_kits_school_list_id_school_lists_id_fk" FOREIGN KEY ("school_list_id") REFERENCES "school_engine"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."search_logs" ADD CONSTRAINT "search_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_school_lists_code" ON "school_engine"."school_lists" USING btree ("access_code");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_year_grade" ON "school_engine"."school_lists" USING btree ("slug","academic_year","grade");--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP COLUMN "display_meta";--> statement-breakpoint
ALTER TABLE "catalog"."products" DROP COLUMN "is_new";--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP COLUMN "price_at_time";--> statement-breakpoint
ALTER TABLE "sales"."order_items" DROP COLUMN "variant_details";--> statement-breakpoint
ALTER TABLE "sales"."orders" DROP COLUMN "shipping_address";--> statement-breakpoint
ALTER TABLE "sales"."orders" DROP COLUMN "billing_address";--> statement-breakpoint
ALTER TABLE "catalog"."product_tags" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "catalog"."tags" DROP COLUMN "localized_label";--> statement-breakpoint
ALTER TABLE "catalog"."tags" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "scope_id";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "customer_group";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "starts_at";--> statement-breakpoint
ALTER TABLE "sales"."discount_rules" DROP COLUMN "ends_at";--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP COLUMN "cart_id";--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP COLUMN "parent_session_id";--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP COLUMN "display_name";--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP COLUMN "school_name";--> statement-breakpoint
ALTER TABLE "school_engine"."cart_kits" DROP COLUMN "grade_label";--> statement-breakpoint
ALTER TABLE "catalog"."products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");--> statement-breakpoint
ALTER TABLE "catalog"."tags" ADD CONSTRAINT "tags_slug_unique" UNIQUE("slug");