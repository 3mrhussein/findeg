ALTER TABLE "sales"."orders" ADD COLUMN "order_reference" text;--> statement-breakpoint
UPDATE "sales"."orders"
SET "order_reference" = 'FE-' || upper(substr(md5(random()::text), 1, 6))
WHERE "order_reference" IS NULL;--> statement-breakpoint
ALTER TABLE "sales"."orders" ALTER COLUMN "order_reference" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_orders_order_reference" ON "sales"."orders" USING btree ("order_reference");--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "ck_orders_order_reference" CHECK ("order_reference" ~ '^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$');--> statement-breakpoint
CREATE OR REPLACE FUNCTION "sales"."freeze_order_snapshots"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF (to_jsonb(NEW) - ARRAY['status', 'payment_status', 'tracking_number', 'admin_notes', 'updated_at'])
      IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'payment_status', 'tracking_number', 'admin_notes', 'updated_at']) THEN
    RAISE EXCEPTION 'Order snapshot columns are frozen' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "freeze_order_snapshots" BEFORE UPDATE ON "sales"."orders"
FOR EACH ROW EXECUTE FUNCTION "sales"."freeze_order_snapshots"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "sales"."freeze_order_items"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Order items are frozen' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Order items cannot be deleted' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "freeze_order_items" BEFORE UPDATE OR DELETE ON "sales"."order_items"
FOR EACH ROW EXECUTE FUNCTION "sales"."freeze_order_items"();
