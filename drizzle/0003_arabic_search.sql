-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Create normalize_arabic Function
CREATE OR REPLACE FUNCTION normalize_arabic(text_to_normalize TEXT)
RETURNS TEXT AS $$
DECLARE
    normalized TEXT;
BEGIN
    IF text_to_normalize IS NULL THEN
        RETURN NULL;
    END IF;

    -- Strip diacritics (tashkeel)
    normalized := unaccent(text_to_normalize);

    -- Normalize Alef variants to bare Alef
    normalized := regexp_replace(normalized, '[إأآٱ]', 'ا', 'g');
    
    -- Normalize Ta Marbuta to Ha
    normalized := regexp_replace(normalized, 'ة', 'ه', 'g');
    
    -- Normalize Ya variants
    normalized := regexp_replace(normalized, 'ى', 'ي', 'g');
    normalized := regexp_replace(normalized, 'ئ', 'ي', 'g');
    
    -- Normalize Waw variants
    normalized := regexp_replace(normalized, 'ؤ', 'و', 'g');
    
    -- Strip definite article (ال)
    -- This handles "ال" at the beginning of words
    normalized := regexp_replace(normalized, '\mال', '', 'g');

    RETURN lower(trim(normalized)); -- Also lower case for English mixed queries
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Add Normalized Columns
ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS name_normalized TEXT;
ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS description_normalized TEXT;
ALTER TABLE category_translations ADD COLUMN IF NOT EXISTS name_normalized TEXT;

-- 4. Create Sync Triggers
CREATE OR REPLACE FUNCTION sync_product_translations_normalized()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.language = 'ar' THEN
        NEW.name_normalized := normalize_arabic(NEW.name);
        NEW.description_normalized := normalize_arabic(NEW.description);
    ELSE
        -- For non-Arabic, we just lowercase and unaccent
        NEW.name_normalized := lower(unaccent(NEW.name));
        NEW.description_normalized := lower(unaccent(NEW.description));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_category_translations_normalized()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.language = 'ar' THEN
        NEW.name_normalized := normalize_arabic(NEW.name);
    ELSE
        NEW.name_normalized := lower(unaccent(NEW.name));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_trans_norm_trg ON product_translations;
CREATE TRIGGER product_trans_norm_trg
    BEFORE INSERT OR UPDATE ON product_translations
    FOR EACH ROW
    EXECUTE FUNCTION sync_product_translations_normalized();

DROP TRIGGER IF EXISTS category_trans_norm_trg ON category_translations;
CREATE TRIGGER category_trans_norm_trg
    BEFORE INSERT OR UPDATE ON category_translations
    FOR EACH ROW
    EXECUTE FUNCTION sync_category_translations_normalized();

-- 5. Backfill Existing Data
UPDATE product_translations 
SET name_normalized = CASE WHEN language = 'ar' THEN normalize_arabic(name) ELSE lower(unaccent(name)) END,
    description_normalized = CASE WHEN language = 'ar' THEN normalize_arabic(description) ELSE lower(unaccent(description)) END;

UPDATE category_translations 
SET name_normalized = CASE WHEN language = 'ar' THEN normalize_arabic(name) ELSE lower(unaccent(name)) END;

-- 6. Create GIN Trigram Indexes
CREATE INDEX IF NOT EXISTS idx_product_trans_name_norm_trgm ON product_translations USING gin (name_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_trans_desc_norm_trgm ON product_translations USING gin (description_normalized gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_trans_name_trgm ON product_translations USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku_trgm ON product_variants USING gin (sku gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_category_trans_name_norm_trgm ON category_translations USING gin (name_normalized gin_trgm_ops);
