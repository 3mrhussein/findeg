ALTER TABLE "sales"."order_items" ADD COLUMN "school_supply_list_item_id" integer;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD COLUMN "is_substitute" boolean;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD COLUMN "school_supply_list_id" integer;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD COLUMN "school_supply_list_public_code" text;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD COLUMN "school_supply_list_published_at" timestamp;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD COLUMN "business_partner_id" integer;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "order_items_school_supply_list_item_id_school_supply_list_items_id_fk" FOREIGN KEY ("school_supply_list_item_id") REFERENCES "school_engine"."school_supply_list_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "orders_school_supply_list_id_school_supply_lists_id_fk" FOREIGN KEY ("school_supply_list_id") REFERENCES "school_engine"."school_supply_lists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "orders_business_partner_id_business_partners_id_fk" FOREIGN KEY ("business_partner_id") REFERENCES "identity"."business_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."order_items" ADD CONSTRAINT "ck_order_items_list_attribution" CHECK (("sales"."order_items"."school_supply_list_item_id" is null and "sales"."order_items"."is_substitute" is null)
      or ("sales"."order_items"."school_supply_list_item_id" is not null and "sales"."order_items"."is_substitute" is not null));--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "ck_orders_list_attribution" CHECK (("sales"."orders"."school_supply_list_id" is null and "sales"."orders"."school_supply_list_public_code" is null and "sales"."orders"."school_supply_list_published_at" is null and "sales"."orders"."business_partner_id" is null)
        or ("sales"."orders"."school_supply_list_id" is not null and "sales"."orders"."school_supply_list_public_code" is not null and "sales"."orders"."school_supply_list_published_at" is not null and "sales"."orders"."business_partner_id" is not null));