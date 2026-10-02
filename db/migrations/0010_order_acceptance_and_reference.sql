ALTER TABLE "sales"."orders" ADD COLUMN "order_reference" text;--> statement-breakpoint
UPDATE "sales"."orders"
SET "order_reference" = 'FE-' || upper(substr(md5(random()::text), 1, 6))
WHERE "order_reference" IS NULL;--> statement-breakpoint
ALTER TABLE "sales"."orders" ALTER COLUMN "order_reference" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_orders_order_reference" ON "sales"."orders" USING btree ("order_reference");--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "ck_orders_order_reference" CHECK ("order_reference" ~ '^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$');--> statement-breakpoint
CREATE OR REPLACE FUNCTION "sales"."freeze_order_snapshots"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
BEGIN
  v_old := to_jsonb(OLD) - ARRAY['status', 'payment_status', 'tracking_number', 'admin_notes', 'updated_at'];
  v_new := to_jsonb(NEW) - ARRAY['status', 'payment_status', 'tracking_number', 'admin_notes', 'updated_at'];

  -- Allow ON DELETE SET NULL cascade on user_id when user account is deleted
  IF OLD.user_id IS NOT NULL AND NEW.user_id IS NULL THEN
    v_old := v_old - 'user_id';
    v_new := v_new - 'user_id';
  END IF;

  IF v_new IS DISTINCT FROM v_old THEN
    RAISE EXCEPTION 'Order snapshot columns are frozen' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "freeze_order_snapshots" BEFORE UPDATE ON "sales"."orders"
FOR EACH ROW EXECUTE FUNCTION "sales"."freeze_order_snapshots"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "sales"."freeze_order_items"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);

    -- Allow catalog ON DELETE SET NULL cascades for product_id and variant_id
    IF OLD.product_id IS NOT NULL AND NEW.product_id IS NULL THEN
      v_old := v_old - 'product_id';
      v_new := v_new - 'product_id';
    END IF;

    IF OLD.variant_id IS NOT NULL AND NEW.variant_id IS NULL THEN
      v_old := v_old - 'variant_id';
      v_new := v_new - 'variant_id';
    END IF;

    IF v_new IS DISTINCT FROM v_old THEN
      RAISE EXCEPTION 'Order items are frozen' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Order items cannot be deleted' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "freeze_order_items" BEFORE UPDATE OR DELETE ON "sales"."order_items"
FOR EACH ROW EXECUTE FUNCTION "sales"."freeze_order_items"();
