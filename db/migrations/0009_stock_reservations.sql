CREATE TABLE "inventory"."stock_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"warehouse_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ck_stock_reservation_quantity" CHECK ("inventory"."stock_reservations"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "inventory"."stock_reservations" ADD CONSTRAINT "stock_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "sales"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_reservations" ADD CONSTRAINT "stock_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "catalog"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_reservations" ADD CONSTRAINT "stock_reservations_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "inventory"."warehouses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_stock_reservation_line" ON "inventory"."stock_reservations" USING btree ("order_id","variant_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "idx_stock_reservations_balance" ON "inventory"."stock_reservations" USING btree ("variant_id","warehouse_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_stock_movements_order_settlement" ON "inventory"."stock_movements" USING btree ("reference_id","movement_type","variant_id","warehouse_id") WHERE "inventory"."stock_movements"."reference_type" = 'order' AND "inventory"."stock_movements"."movement_type" IN ('consume', 'release');--> statement-breakpoint
-- Existing balances may predate the invariant. Clamp them into it so the CHECK
-- validates: reserved never exceeds what is on hand, and neither goes negative.
-- This rewrites offending rows in place and records no audit stock movement.
UPDATE "inventory"."inventory_balances"
SET "on_hand" = GREATEST("on_hand", 0),
    "reserved" = GREATEST(LEAST("reserved", "on_hand"), 0)
WHERE "on_hand" < 0 OR "reserved" < 0 OR "reserved" > "on_hand";--> statement-breakpoint
CREATE FUNCTION "inventory"."stock_reservation_immutable"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Stock reservations are immutable; settle them with stock movements' USING ERRCODE = '23514';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "stock_reservation_immutable" BEFORE UPDATE OR DELETE ON "inventory"."stock_reservations"
FOR EACH ROW EXECUTE FUNCTION "inventory"."stock_reservation_immutable"();
--> statement-breakpoint
ALTER TABLE "inventory"."inventory_balances" ADD CONSTRAINT "ck_inventory_balance_reserved" CHECK ("inventory"."inventory_balances"."on_hand" >= "inventory"."inventory_balances"."reserved" AND "inventory"."inventory_balances"."reserved" >= 0);
