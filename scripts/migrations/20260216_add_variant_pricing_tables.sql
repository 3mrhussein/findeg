-- Phase B migration: add variant sellable UoMs and customer-group price lists

CREATE TABLE IF NOT EXISTS variant_sellable_uoms (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_key TEXT NOT NULL,
  uom_code TEXT NOT NULL,
  factor_to_base NUMERIC(12, 4) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_variant_sellable_uoms_variant_uom
  ON variant_sellable_uoms (product_id, variant_key, uom_code);

CREATE INDEX IF NOT EXISTS idx_variant_sellable_uoms_product_id
  ON variant_sellable_uoms (product_id);

CREATE TABLE IF NOT EXISTS variant_price_lists (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_key TEXT NOT NULL,
  customer_group TEXT NOT NULL,
  uom_code TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  unit_price NUMERIC(12, 2) NOT NULL,
  is_sellable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_variant_price_lists_variant_group_uom
  ON variant_price_lists (product_id, variant_key, customer_group, uom_code);

CREATE INDEX IF NOT EXISTS idx_variant_price_lists_product_id
  ON variant_price_lists (product_id);

CREATE INDEX IF NOT EXISTS idx_variant_price_lists_customer_group
  ON variant_price_lists (customer_group);
