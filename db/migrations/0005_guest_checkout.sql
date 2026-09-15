CREATE TABLE sales.storefront_carts (
  owner_digest text PRIMARY KEY,
  items jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE sales.delivery_zones (
  id serial PRIMARY KEY,
  name jsonb NOT NULL,
  fee numeric(14,2) NOT NULL CHECK (fee >= 0),
  is_active boolean NOT NULL DEFAULT true
);
--> statement-breakpoint
CREATE TABLE sales.accepted_orders (
  reference text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE sales.checkout_outcomes (
  owner_digest text NOT NULL,
  key text NOT NULL,
  fingerprint text NOT NULL,
  order_reference text NOT NULL REFERENCES sales.accepted_orders(reference),
  PRIMARY KEY(owner_digest, key)
);
--> statement-breakpoint
CREATE TABLE sales.guest_order_access (
  reference text PRIMARY KEY,
  order_reference text NOT NULL REFERENCES sales.accepted_orders(reference),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
--> statement-breakpoint
ALTER TABLE inventory.inventory_balances ADD CONSTRAINT nonnegative_available_stock CHECK (on_hand >= reserved AND reserved >= 0);
--> statement-breakpoint
CREATE TABLE inventory.order_reservations (
  order_reference text NOT NULL REFERENCES sales.accepted_orders(reference),
  variant_id integer NOT NULL REFERENCES catalog.product_variants(id),
  warehouse_id integer NOT NULL REFERENCES inventory.warehouses(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(order_reference, variant_id, warehouse_id)
);
--> statement-breakpoint
CREATE TABLE system.checkout_outbox (
  id text PRIMARY KEY,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE FUNCTION sales.preserve_checkout_fact() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Accepted commercial facts are immutable'; END; $$;
--> statement-breakpoint
CREATE TRIGGER immutable_accepted_order BEFORE UPDATE OR DELETE ON sales.accepted_orders FOR EACH ROW EXECUTE FUNCTION sales.preserve_checkout_fact();
--> statement-breakpoint
CREATE TRIGGER immutable_checkout_outcome BEFORE UPDATE OR DELETE ON sales.checkout_outcomes FOR EACH ROW EXECUTE FUNCTION sales.preserve_checkout_fact();
--> statement-breakpoint
CREATE TRIGGER immutable_order_reservation BEFORE UPDATE OR DELETE ON inventory.order_reservations FOR EACH ROW EXECUTE FUNCTION sales.preserve_checkout_fact();