import {
  executeCatalogScoredSearchRaw,
  getCatalogSuggestionsRaw,
  logCatalogSearchRaw,
  getFilteredProducts,
} from '@findeg/db/queries';
import {
  type ISearchService,
  type SearchParams,
  type SearchResult,
  type SuggestResult,
  type ParsedQuery,
  type Suggestion,
} from '../interfaces/ISearchService';
import { ProductService } from './ProductService';
import { type Locale } from '../../../core/domain/value-objects';
import { type ID } from '../../../core/domain/types/common';

export class SearchService implements ISearchService {
  private readonly productService = new ProductService();

  public parseQuery(query: string): ParsedQuery {
    const arabicRegex = /[\u0600-\u06FF]+/g;
    const arabicTerms: string[] = [];
    const englishTerms: string[] = [];

    const tokens = (query || '').trim().split(/\s+/);
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
    normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');
    // Normalize Alef variants
    normalized = normalized.replace(/[إأآٱ]/g, 'ا');
    // Normalize Ta Marbuta to Ha
    normalized = normalized.replace(/ة/g, 'ه');
    // Normalize Ya variants
    normalized = normalized.replace(/[ىئ]/g, 'ي');
    // Normalize Waw variants
    normalized = normalized.replace(/ؤ/g, 'و');
    // Strip definite article (ال) at the beginning of words
    normalized = normalized.replace(/(^|\s)ال/g, '$1');

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
      await logCatalogSearchRaw({
        query: normalizedQuery,
        locale,
        resultsCount,
        userId: userId ? Number(userId) : undefined,
        sessionId,
      });
    } catch (error) {
      console.error('[SearchService] Failed to log search:', error);
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

    return executeCatalogScoredSearchRaw({
      term,
      normalizedTerm,
      locale,
      params,
    });
  }

  public async search(params: SearchParams): Promise<SearchResult> {
    const { query, locale, limit = 20, offset = 0, sort = 'relevance' } = params;

    // If no search query, fallback to the query primitive's generic getFiltered
    if (!query || !query.trim()) {
      const result = await getFilteredProducts({
        limit,
        offset,
        sort: sort === 'relevance' ? undefined : sort,
      });
      this.logSearch(query, locale, result.total, undefined, undefined).catch(() => {});
      return {
        items: result.products as unknown as SearchResult['items'],
        total: result.total,
      };
    }

    const parsed = this.parseQuery(query);
    let allScoredResults: { productId: number; score: number }[];

    if (parsed.arabicTerms.length > 0 && parsed.englishTerms.length > 0) {
      // Mixed query: Search both and combine results
      const [arResults, enResults] = await Promise.all([
        this.executeScoredSearch(parsed.arabicTerms.join(' '), locale, params, true),
        this.executeScoredSearch(parsed.englishTerms.join(' '), locale, params, false),
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
        parsed.arabicTerms.join(' '),
        locale,
        params,
        true,
      );
    } else {
      allScoredResults = await this.executeScoredSearch(
        parsed.englishTerms.join(' '),
        locale,
        params,
        false,
      );
    }

    if (allScoredResults.length === 0) {
      // Log no results
      this.logSearch(query, locale, 0, undefined, undefined).catch(() => {});
      return { items: [], total: 0 };
    }

    // Default sorting is by score, but can be overridden by user selection
    if (sort === 'relevance') {
      allScoredResults.sort((a, b) => b.score - a.score);
    }

    // Calculate pagination over the IDs
    const scoredTotal = allScoredResults.length;
    const pagedIds = allScoredResults.slice(offset, offset + limit).map((r) => r.productId);

    // Hydrate the page of IDs in one batch into storefront-ready products (localized, with
    // variants), keeping the order of `pagedIds`. Ids that no longer exist (e.g. deleted between
    // scoring and hydration) are dropped, and `total` is reduced by the same count so that
    // total and items never disagree.
    const finalItems = await this.productService.getByIds(pagedIds, locale);
    const total = scoredTotal - (pagedIds.length - finalItems.length);

    this.logSearch(query, locale, total, undefined, undefined).catch(() => {});

    return {
      items: finalItems as unknown as SearchResult['items'],
      total,
    };
  }

  public async suggest(query: string, locale: Locale): Promise<SuggestResult> {
    if (!query || query.trim().length === 0) {
      return { products: [], categories: [] };
    }

    const { arabicTerms } = this.parseQuery(query);
    const isArabic = arabicTerms.length > 0;
    const normalizedTerm = isArabic ? this.normalizeArabic(query) : query.toLowerCase().trim();
    const suggestions = await getCatalogSuggestionsRaw({
      query,
      normalizedTerm,
      locale,
    });

    const products: Suggestion[] = suggestions.products.map((product) => ({
      id: product.id,
      name: product.name,
      type: 'product',
      imageUrl: product.imageUrl,
    }));

    const categories: Suggestion[] = suggestions.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      type: 'category',
    }));

    return { products, categories };
  }
}
