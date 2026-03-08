CREATE TABLE "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"action" varchar(10) DEFAULT 'grant' NOT NULL,
	"granted_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" text NOT NULL,
	"variant_key" text NOT NULL,
	"localized_label" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"strike_price" numeric(12, 2),
	"cost_price" numeric(12, 2),
	"weight_grams" integer,
	"barcode" text,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "variant_attributes" (
	"variant_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"value_text" text,
	"value_num" numeric(12, 4),
	"value_bool" boolean,
	CONSTRAINT "variant_attributes_variant_id_attribute_id_pk" PRIMARY KEY("variant_id","attribute_id")
);
--> statement-breakpoint
CREATE TABLE "variant_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_tags" (
	"collection_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "collection_tags_collection_id_tag_id_pk" PRIMARY KEY("collection_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"localized_title" jsonb NOT NULL,
	"localized_subtitle" jsonb,
	"hero_image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
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
CREATE TABLE "warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "discount_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"currency" text,
	"scope" text DEFAULT 'product' NOT NULL,
	"scope_id" integer,
	"customer_group" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discount_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "school_list_item_alternatives" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_item_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_list_id" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"localized_label" jsonb NOT NULL,
	"category_id" integer,
	"quantity_required" integer DEFAULT 1 NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"match_rules" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"school_name" text NOT NULL,
	"grade" text NOT NULL,
	"academic_year" text NOT NULL,
	"localized_title" jsonb NOT NULL,
	"localized_description" jsonb,
	"hero_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_lists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "search_logs" (
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
ALTER TABLE "product_images" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "product_images" CASCADE;--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_sku_unique";--> statement-breakpoint
ALTER TABLE "variant_price_lists" DROP CONSTRAINT "variant_price_lists_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" DROP CONSTRAINT "variant_sellable_uoms_product_id_products_id_fk";
--> statement-breakpoint
DROP INDEX "idx_variant_price_lists_product_id";--> statement-breakpoint
DROP INDEX "idx_variant_sellable_uoms_product_id";--> statement-breakpoint
DROP INDEX "uq_variant_price_lists_variant_group_uom";--> statement-breakpoint
DROP INDEX "uq_variant_sellable_uoms_variant_uom";--> statement-breakpoint
ALTER TABLE "category_translations" ADD COLUMN "name_normalized" text;--> statement-breakpoint
ALTER TABLE "product_translations" ADD COLUMN "name_normalized" text;--> statement-breakpoint
ALTER TABLE "product_translations" ADD COLUMN "description_normalized" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku_prefix" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "variant_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "uom_code" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "uom_factor" numeric(12, 4);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "variant_sku_snapshot" text;--> statement-breakpoint
ALTER TABLE "variant_price_lists" ADD COLUMN "variant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "variant_price_lists" ADD COLUMN "min_qty" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "variant_price_lists" ADD COLUMN "starts_at" timestamp;--> statement-breakpoint
ALTER TABLE "variant_price_lists" ADD COLUMN "ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" ADD COLUMN "variant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" ADD COLUMN "localized_label" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" ADD COLUMN "barcode" text;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "scope" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "attribute_definitions" ADD COLUMN "scope" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_attributes" ADD CONSTRAINT "variant_attributes_attribute_id_attribute_definitions_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_tags" ADD CONSTRAINT "collection_tags_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_tags" ADD CONSTRAINT "collection_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_item_alternatives" ADD CONSTRAINT "school_list_item_alternatives_list_item_id_school_list_items_id_fk" FOREIGN KEY ("list_item_id") REFERENCES "public"."school_list_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_item_alternatives" ADD CONSTRAINT "school_list_item_alternatives_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_items" ADD CONSTRAINT "school_list_items_school_list_id_school_lists_id_fk" FOREIGN KEY ("school_list_id") REFERENCES "public"."school_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_list_items" ADD CONSTRAINT "school_list_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_permissions_user_permission" ON "user_permissions" USING btree ("user_id","permission_id");--> statement-breakpoint
CREATE INDEX "idx_user_permissions_user_id" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_product_key" ON "product_variants" USING btree ("product_id","variant_key");--> statement-breakpoint
CREATE INDEX "idx_variant_product" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_variant_sku" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_variant_attr_variant" ON "variant_attributes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_variant_attr_text" ON "variant_attributes" USING btree ("attribute_id","value_text");--> statement-breakpoint
CREATE INDEX "idx_variant_attr_num" ON "variant_attributes" USING btree ("attribute_id","value_num");--> statement-breakpoint
CREATE INDEX "idx_variant_images_variant" ON "variant_images" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inventory_balance" ON "inventory_balances" USING btree ("variant_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_variant" ON "inventory_balances" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_variant" ON "stock_movements" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_created" ON "stock_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_discount_rules_scope" ON "discount_rules" USING btree ("scope","scope_id");--> statement-breakpoint
CREATE INDEX "idx_discount_rules_active" ON "discount_rules" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "idx_discount_rules_group" ON "discount_rules" USING btree ("customer_group");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_school_alternative" ON "school_list_item_alternatives" USING btree ("list_item_id","variant_id");--> statement-breakpoint
CREATE INDEX "idx_school_alternatives_item" ON "school_list_item_alternatives" USING btree ("list_item_id");--> statement-breakpoint
CREATE INDEX "idx_school_alternatives_variant" ON "school_list_item_alternatives" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_school_list_items_list" ON "school_list_items" USING btree ("school_list_id");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_price_lists" ADD CONSTRAINT "variant_price_lists_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" ADD CONSTRAINT "variant_sellable_uoms_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_variant_price_lists_variant" ON "variant_price_lists" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_variant_sellable_uoms_variant" ON "variant_sellable_uoms" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_price_lists_variant_group_uom" ON "variant_price_lists" USING btree ("variant_id","customer_group","uom_code","min_qty");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_sellable_uoms_variant_uom" ON "variant_sellable_uoms" USING btree ("variant_id","uom_code");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "strike_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "pricing";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "discount_rules";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "stock_quantity";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "low_stock_threshold";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "variants";--> statement-breakpoint
ALTER TABLE "variant_price_lists" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "variant_price_lists" DROP COLUMN "variant_key";--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "variant_sellable_uoms" DROP COLUMN "variant_key";