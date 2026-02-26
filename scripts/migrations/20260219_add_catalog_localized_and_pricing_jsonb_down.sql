BEGIN;

ALTER TABLE products
  DROP COLUMN IF EXISTS discount_rules,
  DROP COLUMN IF EXISTS pricing,
  DROP COLUMN IF EXISTS media_set,
  DROP COLUMN IF EXISTS localized_long_description,
  DROP COLUMN IF EXISTS localized_description,
  DROP COLUMN IF EXISTS localized_name,
  DROP COLUMN IF EXISTS localized_slug;

ALTER TABLE categories
  DROP COLUMN IF EXISTS localized_description,
  DROP COLUMN IF EXISTS localized_name,
  DROP COLUMN IF EXISTS localized_slug;

ALTER TABLE brands
  DROP COLUMN IF EXISTS localized_slug,
  DROP COLUMN IF EXISTS localized_name;

COMMIT;
