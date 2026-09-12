CREATE TABLE "school_engine"."school_supply_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_partner_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"source_list_id" integer,
	"replaces_list_id" integer,
	"replaced_by_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"academic_year" text NOT NULL,
	"school_name" text NOT NULL,
	"grade" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text NOT NULL,
	"public_code" text,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "school_supply_list_status" CHECK ("school_engine"."school_supply_lists"."status" in ('draft', 'published', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "school_engine"."school_supply_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"exact_item" integer DEFAULT 0 NOT NULL,
	"product_name_en" text DEFAULT '' NOT NULL,
	"product_name_ar" text DEFAULT '' NOT NULL,
	"sku" text DEFAULT '' NOT NULL,
	"label_en" text NOT NULL,
	"label_ar" text NOT NULL,
	"unit_price" text DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_lists" ADD CONSTRAINT "school_supply_lists_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_lists" ADD CONSTRAINT "school_supply_lists_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "school_engine"."school_supply_list_items" ADD CONSTRAINT "school_supply_list_items_list_id_school_supply_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "school_supply_list_public_code" ON "school_engine"."school_supply_lists" USING btree ("public_code");
--> statement-breakpoint
CREATE INDEX "school_supply_lists_partner" ON "school_engine"."school_supply_lists" USING btree ("business_partner_id", "status");
--> statement-breakpoint
CREATE INDEX "school_supply_list_items_list" ON "school_engine"."school_supply_list_items" USING btree ("list_id");