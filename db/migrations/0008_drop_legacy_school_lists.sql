ALTER TABLE "sales"."order_items" DROP COLUMN "cart_kit_id";--> statement-breakpoint
DROP TABLE "school_engine"."cart_kits" CASCADE;--> statement-breakpoint
DROP TABLE "school_engine"."school_list_item_alternatives" CASCADE;--> statement-breakpoint
DROP TABLE "school_engine"."school_list_items" CASCADE;--> statement-breakpoint
DROP TABLE "school_engine"."school_lists" CASCADE;--> statement-breakpoint
DROP TABLE "school_engine"."school_list_parent_sessions" CASCADE;
