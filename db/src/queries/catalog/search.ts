import { sql } from 'drizzle-orm';

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

export async function executeCatalogScoredSearchRaw(input: {
  term: string;
  normalizedTerm: string;
  locale: string;
  params: CatalogSearchQueryRawParams;
}): Promise<CatalogSearchScoreRowRaw[]> {
  if (!input.term) return [];

  const likePattern = `%${input.normalizedTerm}%`;

  const query = sql`
      SELECT p.id as "productId", MAX(
        GREATEST(
          CASE WHEN pt.name_normalized = ${input.normalizedTerm} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name_normalized, ''), ${input.normalizedTerm}),

          CASE WHEN pt.description_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.description_normalized, ''), ${input.normalizedTerm}),

          CASE WHEN pt.name = ${input.term} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name, ''), ${input.term}),

          CASE WHEN v.sku ILIKE ${likePattern} THEN 0.9 ELSE 0 END,

          CASE WHEN ct.name_normalized ILIKE ${likePattern} THEN 0.7 ELSE 0 END,
          similarity(COALESCE(ct.name_normalized, ''), ${input.normalizedTerm})
        )
      ) as score
      FROM products p
      LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.language = ${input.locale}
      LEFT JOIN product_variants v ON v.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.language = ${input.locale}
      WHERE p.is_active = true
        ${input.params.categoryId ? sql`AND c.path LIKE (SELECT path FROM categories WHERE id = ${input.params.categoryId}) || '%'` : sql``}
        ${input.params.brandId ? sql`AND p.brand_id = ${input.params.brandId}` : sql``}
        ${input.params.minPrice ? sql`AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.base_price >= ${input.params.minPrice})` : sql``}
        ${input.params.maxPrice ? sql`AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.base_price <= ${input.params.maxPrice})` : sql``}
        ${input.params.inStockOnly ? sql`AND EXISTS (SELECT 1 FROM product_variants pv JOIN inventory_balances ib ON ib.variant_id = pv.id WHERE pv.product_id = p.id AND (ib.on_hand - ib.reserved) > 0)` : sql``}
      GROUP BY p.id
      HAVING MAX(GREATEST(
          CASE WHEN pt.name_normalized = ${input.normalizedTerm} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name_normalized, ''), ${input.normalizedTerm}),

          CASE WHEN pt.description_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.description_normalized, ''), ${input.normalizedTerm}),

          CASE WHEN pt.name = ${input.term} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name, ''), ${input.term}),

          CASE WHEN v.sku ILIKE ${likePattern} THEN 0.9 ELSE 0 END,

          CASE WHEN ct.name_normalized ILIKE ${likePattern} THEN 0.7 ELSE 0 END,
          similarity(COALESCE(ct.name_normalized, ''), ${input.normalizedTerm})
      )) > 0.2
      ORDER BY score DESC
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
  const prefixPattern = `${input.normalizedTerm}%`;

  const productQuery = sql`
      SELECT p.id, pt.name, pv.url as image_url
      FROM products p
      INNER JOIN product_translations pt ON pt.product_id = p.id AND pt.language = ${input.locale}
      LEFT JOIN variant_images pv ON pv.variant_id = (
        SELECT id FROM product_variants WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1
      ) AND pv.display_order = 0
      WHERE p.is_active = true
        AND (pt.name_normalized ILIKE ${prefixPattern} OR pt.name ILIKE ${prefixPattern})
      LIMIT 5
    `;

  const categoryQuery = sql`
      SELECT c.id, c.slug, ct.name
      FROM categories c
      INNER JOIN category_translations ct ON ct.category_id = c.id AND ct.language = ${input.locale}
      WHERE c.is_active = true
        AND (ct.name_normalized ILIKE ${prefixPattern} OR ct.name ILIKE ${prefixPattern})
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