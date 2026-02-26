BEGIN;

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS localized_name JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS localized_slug JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS localized_slug JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS localized_name JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS localized_description JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS localized_slug JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS localized_name JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS localized_description JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS localized_long_description JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS media_set JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing JSONB,
  ADD COLUMN IF NOT EXISTS discount_rules JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE brands
SET
  localized_name = CASE
    WHEN localized_name = '{}'::jsonb THEN jsonb_build_object('en', name, 'ar', name)
    ELSE localized_name
  END,
  localized_slug = CASE
    WHEN localized_slug = '{}'::jsonb THEN jsonb_build_object('en', slug, 'ar', slug)
    ELSE localized_slug
  END;

UPDATE categories c
SET
  localized_name = COALESCE(
    NULLIF(
      (
        SELECT jsonb_object_agg(ct.language, ct.name)
        FROM category_translations ct
        WHERE ct.category_id = c.id
      ),
      'null'::jsonb
    ),
    localized_name
  ),
  localized_description = COALESCE(
    NULLIF(
      (
        SELECT jsonb_object_agg(ct.language, ct.description)
        FROM category_translations ct
        WHERE ct.category_id = c.id
          AND ct.description IS NOT NULL
      ),
      'null'::jsonb
    ),
    localized_description
  )
WHERE localized_name = '{}'::jsonb OR localized_description = '{}'::jsonb;

UPDATE categories
SET localized_slug = COALESCE(localized_slug, '{}'::jsonb)
WHERE localized_slug = '{}'::jsonb;

UPDATE products p
SET
  localized_name = COALESCE(
    NULLIF(
      (
        SELECT jsonb_object_agg(pt.language, pt.name)
        FROM product_translations pt
        WHERE pt.product_id = p.id
      ),
      'null'::jsonb
    ),
    localized_name
  ),
  localized_description = COALESCE(
    NULLIF(
      (
        SELECT jsonb_object_agg(pt.language, pt.description)
        FROM product_translations pt
        WHERE pt.product_id = p.id
      ),
      'null'::jsonb
    ),
    localized_description
  ),
  localized_long_description = COALESCE(
    NULLIF(
      (
        SELECT jsonb_object_agg(pt.language, pt.long_description)
        FROM product_translations pt
        WHERE pt.product_id = p.id
      ),
      'null'::jsonb
    ),
    localized_long_description
  ),
  pricing = COALESCE(
    pricing,
    jsonb_build_object(
      'base',
      jsonb_build_object('amount', COALESCE(p.price, 0), 'currency', 'EGP'),
      'tiers',
      '[]'::jsonb
    )
  )
WHERE localized_name = '{}'::jsonb
   OR localized_description = '{}'::jsonb
   OR localized_long_description = '{}'::jsonb
   OR pricing IS NULL;

COMMIT;
