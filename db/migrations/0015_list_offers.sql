CREATE TABLE "sales"."list_offers" (
	"list_id" integer PRIMARY KEY NOT NULL,
	"basis_points" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_list_offers_basis_points" CHECK ("sales"."list_offers"."basis_points" between 0 and 10000),
	CONSTRAINT "ck_list_offers_window" CHECK ("sales"."list_offers"."ends_at" is null or "sales"."list_offers"."ends_at" > "sales"."list_offers"."starts_at")
);
--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD COLUMN "line_total" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD COLUMN "list_offer_basis_points" integer;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD COLUMN "discount_total" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales"."list_offers" ADD CONSTRAINT "list_offers_list_id_school_supply_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" DISABLE TRIGGER "freeze_order_items";--> statement-breakpoint
UPDATE "sales"."order_items" SET "line_total" = "total_price", "unit_price" = COALESCE("unit_price_snapshot", "unit_price");--> statement-breakpoint
ALTER TABLE "sales"."order_items" ENABLE TRIGGER "freeze_order_items";
