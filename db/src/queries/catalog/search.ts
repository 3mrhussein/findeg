import { sql, type SQL } from 'drizzle-orm';

import { db } from '../../connection';
import { searchLogs } from '../../schema';

export interface CatalogSearchQueryRawParams {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export interface CatalogSearchScoreRowRaw {
  productId: number;
  score: number;
}

export interface CatalogSearchSuggestionProductRaw {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface CatalogSearchSuggestionCategoryRaw {
  id: number;
  slug: string;
  name: string;
}

export async function logCatalogSearchRaw(input: {
  query: string;
  locale: string;
  resultsCount: number;
  userId?: number;
  sessionId?: string;
}): Promise<void> {
  await db.insert(searchLogs).values({
    query: input.query.substring(0, 255),
    locale: input.locale,
    resultsCount: input.resultsCount,
    userId: input.userId,
    sessionId: input.sessionId || undefined,
  });
}

/**
 * Fuzzy matching decision: typo tolerance (trigram `similarity`) is NOT
 * supported. The migrated schema does not enable `pg_trgm`, and adding an
 * extension for a storefront-only nicety is not worth the migration and
 * operational dependency. Search is therefore deterministic: exact, substring
 * (ILIKE) and SKU matches over the localized name/description JSONB maps,
 * with Arabic letter-variant normalization done in SQL (see `normalizedText`).
 * A query with no match returns no rows; callers decide on any fallback UI.
 * Revisit by enabling pg_trgm and adding `similarity(...)` terms to `scoreOf`.
 */

/** Escapes LIKE wildcards so user input is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Localized text from a JSONB map: requested locale, falling back to English.
 */
function localizedText(column: SQL, locale: string): SQL {
  return sql`COALESCE(NULLIF(${column}->>${locale}, ''), ${column}->>'en', '')`;
}

/**
 * Lower-cases and applies the same Arabic normalization as
 * `SearchService.normalizeArabic` (diacritics, alef/ta marbuta/ya/waw
 * variants, leading definite article) so stored text and terms compare equal.
 */
function normalizedText(text: SQL): SQL {
  return sql`regexp_replace(
    translate(
      regexp_replace(lower(${text}), '[ً-ٰٟ]', '', 'g'),
      'إأآٱةىئؤ', 'ااااهييو'
    ),
    '(^|\\s)ال', '\\1', 'g'
  )`;
}

export async function executeCatalogScoredSearchRaw(input: {
  term: string;
  normalizedTerm: string;
  locale: string;
  params: CatalogSearchQueryRawParams;
}): Promise<CatalogSearchScoreRowRaw[]> {
  if (!input.term) return [];

  const likePattern = `%${escapeLike(input.normalizedTerm)}%`;
  const name = normalizedText(localizedText(sql`p.localized_name`, input.locale));
  const description = normalizedText(localizedText(sql`p.localized_description`, input.locale));
  const categoryName = normalizedText(localizedText(sql`c.localized_name`, input.locale));

  const scoreOf = sql`GREATEST(
    CASE WHEN ${name} = ${input.normalizedTerm} THEN 1.0 ELSE 0 END,
    CASE WHEN ${name} LIKE ${likePattern} THEN 0.8 ELSE 0 END,
    CASE WHEN ${description} LIKE ${likePattern} THEN 0.8 ELSE 0 END,
    CASE WHEN lower(v.sku) LIKE ${likePattern} THEN 0.9 ELSE 0 END,
    CASE WHEN ${categoryName} LIKE ${likePattern} THEN 0.7 ELSE 0 END
  )`;

  const { categoryId, brandId, minPrice, maxPrice, inStockOnly } = input.params;

  const query = sql`
      SELECT p.id as "productId", MAX(${scoreOf}) as score
      FROM catalog.products p
      JOIN catalog.product_variants v ON v.product_id = p.id AND v.is_active = true
      LEFT JOIN catalog.categories c ON c.id = p.category_id
      WHERE p.is_active = true
        ${categoryId ? sql`AND c.path LIKE (SELECT path FROM catalog.categories WHERE id = ${categoryId}) || '%'` : sql``}
        ${brandId ? sql`AND p.brand_id = ${brandId}` : sql``}
        ${minPrice ? sql`AND EXISTS (SELECT 1 FROM catalog.product_variants pv WHERE pv.product_id = p.id AND pv.base_price >= ${minPrice})` : sql``}
        ${maxPrice ? sql`AND EXISTS (SELECT 1 FROM catalog.product_variants pv WHERE pv.product_id = p.id AND pv.base_price <= ${maxPrice})` : sql``}
        ${inStockOnly ? sql`AND EXISTS (SELECT 1 FROM catalog.product_variants pv JOIN inventory.inventory_balances ib ON ib.variant_id = pv.id WHERE pv.product_id = p.id AND (ib.on_hand - ib.reserved) > 0)` : sql``}
      GROUP BY p.id
      HAVING MAX(${scoreOf}) > 0
      ORDER BY score DESC, p.id ASC
    `;

  const results = await db.execute(query);

  return (results as unknown as Record<string, unknown>[]).map((row) => ({
    productId: Number(row.productId),
    score: Number(row.score),
  }));
}

export async function getCatalogSuggestionsRaw(input: {
  query: string;
  normalizedTerm: string;
  locale: string;
}): Promise<{
  products: CatalogSearchSuggestionProductRaw[];
  categories: CatalogSearchSuggestionCategoryRaw[];
}> {
  const prefixPattern = `${escapeLike(input.normalizedTerm)}%`;
  const productName = localizedText(sql`p.localized_name`, input.locale);
  const categoryName = localizedText(sql`c.localized_name`, input.locale);

  const productQuery = sql`
      SELECT p.id, ${productName} as name, vi.url as image_url
      FROM catalog.products p
      LEFT JOIN catalog.variant_images vi ON vi.variant_id = (
        SELECT id FROM catalog.product_variants
        WHERE product_id = p.id AND is_active = true
        ORDER BY is_default DESC, sort_order ASC, id ASC LIMIT 1
      ) AND vi.display_order = 0
      WHERE p.is_active = true
        AND ${normalizedText(productName)} LIKE ${prefixPattern}
      ORDER BY p.id ASC
      LIMIT 5
    `;

  const categoryQuery = sql`
      SELECT c.id, c.slug, ${categoryName} as name
      FROM catalog.categories c
      WHERE c.is_active = true
        AND ${normalizedText(categoryName)} LIKE ${prefixPattern}
      ORDER BY c.sort_order ASC, c.id ASC
      LIMIT 3
    `;

  const [productResults, categoryResults] = await Promise.all([
    db.execute(productQuery),
    db.execute(categoryQuery),
  ]);

  return {
    products: (productResults as unknown as Record<string, unknown>[]).map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      imageUrl: row.image_url ? String(row.image_url) : undefined,
    })),
    categories: (categoryResults as unknown as Record<string, unknown>[]).map((row) => ({
      id: Number(row.id),
      slug: String(row.slug),
      name: String(row.name),
    })),
  };
}
