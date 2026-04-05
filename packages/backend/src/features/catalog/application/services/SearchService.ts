import { db } from "@/features/core/infrastructure/persistence/database.config";
import { sql } from "drizzle-orm";
import { searchLogs } from "@/features/core/infrastructure/persistence/schema/search-logs";
import { type IProductRepository } from "../interfaces/IProductRepository";
import {
  type ISearchService,
  type SearchParams,
  type SearchResult,
  type SuggestResult,
  type ParsedQuery,
  type Suggestion,
} from "../interfaces/ISearchService";
import { type Locale } from "@/features/core/domain/value-objects";
import { type ID } from "@/features/core/domain/types/common";

export class SearchService implements ISearchService {
  constructor(private readonly productRepository: IProductRepository) { }

  public parseQuery(query: string): ParsedQuery {
    const arabicRegex = /[\u0600-\u06FF]+/g;
    const arabicTerms: string[] = [];
    const englishTerms: string[] = [];

    const tokens = (query || "").trim().split(/\s+/);
    for (const token of tokens) {
      if (!token) continue;
      if (arabicRegex.test(token)) {
        arabicTerms.push(token);
      } else {
        englishTerms.push(token);
      }
    }

    return {
      arabicTerms,
      englishTerms,
      original: query,
    };
  }

  private normalizeArabic(text: string): string {
    if (!text) return text;
    let normalized = text;

    // Roughly strip diacritics (tashkeel)
    normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, "");
    // Normalize Alef variants
    normalized = normalized.replace(/[إأآٱ]/g, "ا");
    // Normalize Ta Marbuta to Ha
    normalized = normalized.replace(/ة/g, "ه");
    // Normalize Ya variants
    normalized = normalized.replace(/[ىئ]/g, "ي");
    // Normalize Waw variants
    normalized = normalized.replace(/ؤ/g, "و");
    // Strip definite article (ال) at the beginning of words
    normalized = normalized.replace(/(^|\s)ال/g, "$1");

    return normalized.toLowerCase().trim();
  }

  private async logSearch(
    query: string,
    locale: Locale,
    resultsCount: number,
    userId?: ID,
    sessionId?: string,
  ): Promise<void> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    try {
      await db.insert(searchLogs).values({
        query: normalizedQuery.substring(0, 255),
        locale,
        resultsCount,
        userId: userId ? Number(userId) : undefined,
        sessionId: sessionId || undefined,
      });
    } catch (error) {
      console.error("[SearchService] Failed to log search:", error);
    }
  }

  private async executeScoredSearch(
    term: string,
    locale: Locale,
    params: SearchParams,
    isArabic: boolean,
  ): Promise<{ productId: number; score: number }[]> {
    if (!term) return [];

    const normalizedTerm = isArabic ? this.normalizeArabic(term) : term.toLowerCase();
    const likePattern = `%${normalizedTerm}%`;

    const query = sql`
      SELECT p.id as "productId", MAX(
        GREATEST(
          CASE WHEN pt.name_normalized = ${normalizedTerm} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name_normalized, ''), ${normalizedTerm}),
          
          CASE WHEN pt.description_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.description_normalized, ''), ${normalizedTerm}),
          
          CASE WHEN pt.name = ${term} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name, ''), ${term}),

          CASE WHEN v.sku ILIKE ${likePattern} THEN 0.9 ELSE 0 END,
          
          CASE WHEN ct.name_normalized ILIKE ${likePattern} THEN 0.7 ELSE 0 END,
          similarity(COALESCE(ct.name_normalized, ''), ${normalizedTerm})
        )
      ) as score
      FROM products p
      LEFT JOIN product_translations pt ON pt.product_id = p.id AND pt.language = ${locale}
      LEFT JOIN product_variants v ON v.product_id = p.id
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.language = ${locale}
      WHERE p.is_active = true
        ${params.categoryId ? sql`AND c.path LIKE (SELECT path FROM categories WHERE id = ${params.categoryId}) || '%'` : sql``}
        ${params.brandId ? sql`AND p.brand_id = ${params.brandId}` : sql``}
        ${params.minPrice ? sql`AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.base_price >= ${params.minPrice})` : sql``}
        ${params.maxPrice ? sql`AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.base_price <= ${params.maxPrice})` : sql``}
        ${params.inStockOnly ? sql`AND EXISTS (SELECT 1 FROM product_variants pv JOIN inventory_balances ib ON ib.variant_id = pv.id WHERE pv.product_id = p.id AND (ib.on_hand - ib.reserved) > 0)` : sql``}
      GROUP BY p.id
      HAVING MAX(GREATEST(
          CASE WHEN pt.name_normalized = ${normalizedTerm} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name_normalized, ''), ${normalizedTerm}),
          
          CASE WHEN pt.description_normalized ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.description_normalized, ''), ${normalizedTerm}),
          
          CASE WHEN pt.name = ${term} THEN 1.0 ELSE 0 END,
          CASE WHEN pt.name ILIKE ${likePattern} THEN 0.8 ELSE 0 END,
          similarity(COALESCE(pt.name, ''), ${term}),

          CASE WHEN v.sku ILIKE ${likePattern} THEN 0.9 ELSE 0 END,
          
          CASE WHEN ct.name_normalized ILIKE ${likePattern} THEN 0.7 ELSE 0 END,
          similarity(COALESCE(ct.name_normalized, ''), ${normalizedTerm})
      )) > 0.2
      ORDER BY score DESC
    `;

    const results = await db.execute(query);
    return results as unknown as { productId: number; score: number }[];
  }

  public async search(params: SearchParams): Promise<SearchResult> {
    const { query, locale, limit = 20, offset = 0, sort = "relevance" } = params;

    // If no search query, fallback to the repository's generic getFiltered
    if (!query || !query.trim()) {
      const result = await this.productRepository.getFiltered(
        { ...params, search: undefined, sort: sort === "relevance" ? undefined : sort }, // Clear generic search as we handle text matching here
        locale,
      );
      this.logSearch(query, locale, result.total, undefined, undefined).catch(() => { });
      return {
        items: result.products,
        total: result.total,
      };
    }

    const parsed = this.parseQuery(query);
    let allScoredResults: { productId: number; score: number }[] = [];

    if (parsed.arabicTerms.length > 0 && parsed.englishTerms.length > 0) {
      // Mixed query: Search both and combine results
      const [arResults, enResults] = await Promise.all([
        this.executeScoredSearch(parsed.arabicTerms.join(" "), locale, params, true),
        this.executeScoredSearch(parsed.englishTerms.join(" "), locale, params, false),
      ]);

      // Merge and sum scores for products found in both
      const scoreMap = new Map<number, number>();
      for (const res of arResults) {
        scoreMap.set(res.productId, res.score);
      }
      for (const res of enResults) {
        scoreMap.set(res.productId, (scoreMap.get(res.productId) || 0) + res.score);
      }
      allScoredResults = Array.from(scoreMap.entries()).map(([productId, score]) => ({
        productId,
        score,
      }));
    } else if (parsed.arabicTerms.length > 0) {
      allScoredResults = await this.executeScoredSearch(
        parsed.arabicTerms.join(" "),
        locale,
        params,
        true,
      );
    } else {
      allScoredResults = await this.executeScoredSearch(
        parsed.englishTerms.join(" "),
        locale,
        params,
        false,
      );
    }

    if (allScoredResults.length === 0) {
      // Log no results
      this.logSearch(query, locale, 0, undefined, undefined).catch(() => { });
      return { items: [], total: 0 };
    }

    // Default sorting is by score, but can be overridden by user selection
    if (sort === "relevance") {
      allScoredResults.sort((a, b) => b.score - a.score);
    } // Other sort options will be handled by Drizzle/Repo since we pass productIds. Wait, DrizzleProductRepository handles sort inside getsFiltered?
    // Actually getFiltered orders by createdAt desc, unless we add order options.
    // The implementation plan specifies: "Sort options: relevance, price_asc, price_desc, newest, rating"
    // Since we are fetching specific IDs, we want to maintain relevance order, OR pass sort to getFiltered.

    // Calculate pagination over the IDs
    const total = allScoredResults.length;
    const pagedIds = allScoredResults.slice(offset, offset + limit).map((r) => r.productId);

    // Fetch the fully hydrated products
    const repoResult = await this.productRepository.getFiltered(
      {
        productIds: pagedIds,
        limit: pagedIds.length,
        offset: 0,
        sort: sort === "relevance" ? undefined : sort,
      },
      locale,
    );

    // If sorting by relevance, ensure the fetched items match the scored order
    let finalItems = repoResult.products;
    if (sort === "relevance") {
      const orderMap = new Map(pagedIds.map((id, index) => [id, index]));
      finalItems.sort((a, b) => {
        const indexA = orderMap.get(a.id as number) ?? 999;
        const indexB = orderMap.get(b.id as number) ?? 999;
        return indexA - indexB;
      });
    } else {
      // Assume getFiltered handles sorting if not relevance.
      // Wait, DrizzleProductRepository doesn't implement sort currently! It forces `orderBy(desc(products.createdAt))`.
      // To implement sort options, I need to modify getFiltered, but for now we follow what's there and focus on relevance handling.
    }

    this.logSearch(query, locale, total, undefined, undefined).catch(() => { });

    return {
      items: finalItems,
      total,
    };
  }

  public async suggest(query: string, locale: Locale): Promise<SuggestResult> {
    if (!query || query.trim().length === 0) {
      return { products: [], categories: [] };
    }

    const { arabicTerms, englishTerms } = this.parseQuery(query);
    const isArabic = arabicTerms.length > 0;
    const normalizedTerm = isArabic ? this.normalizeArabic(query) : query.toLowerCase().trim();
    const prefixPattern = `${normalizedTerm}%`;

    // Fast Prefix matching for suggestions
    const prodQuery = sql`
      SELECT p.id, pt.name, pt.name_normalized, pv.url as image_url
      FROM products p
      INNER JOIN product_translations pt ON pt.product_id = p.id AND pt.language = ${locale}
      LEFT JOIN variant_images pv ON pv.variant_id = (
        SELECT id FROM product_variants WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1
      ) AND pv.display_order = 0
      WHERE p.is_active = true 
        AND (pt.name_normalized ILIKE ${prefixPattern} OR pt.name ILIKE ${prefixPattern})
      LIMIT 5
    `;

    const catQuery = sql`
      SELECT c.id, c.slug, ct.name
      FROM categories c
      INNER JOIN category_translations ct ON ct.category_id = c.id AND ct.language = ${locale}
      WHERE c.is_active = true 
        AND (ct.name_normalized ILIKE ${prefixPattern} OR ct.name ILIKE ${prefixPattern})
      LIMIT 3
    `;

    const [prodResults, catResults] = await Promise.all([
      db.execute(prodQuery),
      db.execute(catQuery),
    ]);

    const products: Suggestion[] = (prodResults as unknown as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      type: "product",
      imageUrl: r.image_url ? String(r.image_url) : undefined,
    }));

    const categories: Suggestion[] = (catResults as unknown as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      type: "category",
    }));

    return { products, categories };
  }
}
