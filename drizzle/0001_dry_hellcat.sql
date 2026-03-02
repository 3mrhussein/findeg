CREATE TABLE "product_tags" (
	"product_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_tags_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"group" text NOT NULL,
	"key" text NOT NULL,
	"localized_label" jsonb NOT NULL,
	"description" jsonb,
	"icon" text,
	"color" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"data_type" text NOT NULL,
	"unit" text,
	"localized_label" jsonb NOT NULL,
	"enum_values" jsonb,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attribute_definitions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"product_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	"value_text" text,
	"value_num" numeric(12, 4),
	"value_bool" boolean,
	CONSTRAINT "product_attributes_product_id_attribute_id_pk" PRIMARY KEY("product_id","attribute_id")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "display_meta" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_attribute_definitions_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_tags_product" ON "product_tags" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_tags_tag" ON "product_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tags_group_key" ON "tags" USING btree ("group","key");--> statement-breakpoint
CREATE INDEX "idx_product_attributes_product" ON "product_attributes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_attributes_attr" ON "product_attributes" USING btree ("attribute_id");--> statement-breakpoint
CREATE INDEX "idx_product_attributes_text" ON "product_attributes" USING btree ("attribute_id","value_text");--> statement-breakpoint
CREATE INDEX "idx_product_attributes_num" ON "product_attributes" USING btree ("attribute_id","value_num");