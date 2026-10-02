ALTER TABLE "sales"."orders" ADD COLUMN "order_reference" text;--> statement-breakpoint
DO $$
DECLARE
  r record;
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  candidate text;
BEGIN
  FOR r IN SELECT id FROM "sales"."orders" WHERE "order_reference" IS NULL LOOP
    LOOP
      candidate := 'FE-';
      FOR i IN 1..6 LOOP
        candidate := candidate || substr(alphabet, 1 + floor(random() * 32)::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "sales"."orders" WHERE "order_reference" = candidate);
    END LOOP;
    UPDATE "sales"."orders" SET "order_reference" = candidate WHERE id = r.id;
  END LOOP;
END;
$$;--> statement-breakpoint
ALTER TABLE "sales"."orders" ALTER COLUMN "order_reference" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_orders_order_reference" ON "sales"."orders" USING btree ("order_reference");--> statement-breakpoint
ALTER TABLE "sales"."orders" ADD CONSTRAINT "ck_orders_order_reference" CHECK ("order_reference" ~ '^FE-[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$');--> statement-breakpoint
CREATE OR REPLACE FUNCTION "sales"."freeze_order_snapshots"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_old jsonb;
  v_new jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Orders cannot be deleted' USING ERRCODE = '23514';
  END IF;

  v_old := to_jsonb(OLD) - ARRAY['status', 'payment_status', 'tracking_number', 'admin_notes', 'updated_at'];
  v_new := to_jsonb(NEW) - ARRAY['status', 'payment_status', 'tracking_number', 'admin_notes', 'updated_at'];

  -- Allow ON DELETE SET NULL on user_id only when fired by the FK action (nested trigger depth),
  -- never from a direct UPDATE statement
  IF pg_trigger_depth() > 1 AND OLD.user_id IS NOT NULL AND NEW.user_id IS NULL THEN
    v_old := v_old - 'user_id';
    v_new := v_new - 'user_id';
  END IF;

  IF v_new IS DISTINCT FROM v_old THEN
    RAISE EXCEPTION 'Order snapshot columns are frozen' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "freeze_order_snapshots" BEFORE UPDATE OR DELETE ON "sales"."orders"
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
    IF pg_trigger_depth() > 1 AND OLD.product_id IS NOT NULL AND NEW.product_id IS NULL THEN
      v_old := v_old - 'product_id';
      v_new := v_new - 'product_id';
    END IF;

    IF pg_trigger_depth() > 1 AND OLD.variant_id IS NOT NULL AND NEW.variant_id IS NULL THEN
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
