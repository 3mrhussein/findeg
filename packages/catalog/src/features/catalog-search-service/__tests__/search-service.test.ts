import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchService } from '../index';
import { ProductService } from '../../catalog-product-service/index';

const {
  executeCatalogScoredSearchRaw,
  getCatalogSuggestionsRaw,
  logCatalogSearchRaw,
  getFilteredProducts,
} = vi.hoisted(() => ({
  executeCatalogScoredSearchRaw: vi.fn(),
  getCatalogSuggestionsRaw: vi.fn(),
  logCatalogSearchRaw: vi.fn(),
  getFilteredProducts: vi.fn(),
}));
vi.mock('@findeg/db/queries', () => ({
  executeCatalogScoredSearchRaw,
  getCatalogSuggestionsRaw,
  logCatalogSearchRaw,
  getFilteredProducts,
}));

describe('SearchService', () => {
  let service: SearchService;
  let getByIds: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SearchService();
    logCatalogSearchRaw.mockResolvedValue(undefined);
    getByIds = vi.spyOn(ProductService.prototype, 'getByIds').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('splits a query into Arabic and English terms', () => {
    expect(service.parseQuery('  pen  قلم  blue ')).toEqual({
      arabicTerms: ['قلم'],
      englishTerms: ['pen', 'blue'],
      original: '  pen  قلم  blue ',
    });
    expect(service.parseQuery('').englishTerms).toEqual([]);
  });

  it('falls back to the filtered listing when the query is blank', async () => {
    getFilteredProducts.mockResolvedValue({ products: [{ id: 1 }], total: 1 });
    const result = await service.search({ query: '  ', locale: 'en', sort: 'price' } as never);
    expect(getFilteredProducts).toHaveBeenCalledWith({ limit: 20, offset: 0, sort: 'price' });
    expect(result).toEqual({ items: [{ id: 1 }], total: 1 });
  });

  it('searches English terms, ranks by score and hydrates the page of ids', async () => {
    executeCatalogScoredSearchRaw.mockResolvedValue([
      { productId: 1, score: 1 },
      { productId: 2, score: 5 },
    ]);
    getByIds.mockResolvedValue([{ id: 2 }, { id: 1 }]);
    const result = await service.search({ query: 'Pen', locale: 'en', limit: 2 } as never);
    expect(executeCatalogScoredSearchRaw).toHaveBeenCalledWith(
      expect.objectContaining({ normalizedTerm: 'pen', locale: 'en' }),
    );
    expect(getByIds).toHaveBeenCalledWith([2, 1], 'en');
    expect(result).toEqual({ items: [{ id: 2 }, { id: 1 }], total: 2 });
  });

  it('keeps sort order when the sort is not relevance and pages the ids', async () => {
    executeCatalogScoredSearchRaw.mockResolvedValue([
      { productId: 1, score: 1 },
      { productId: 2, score: 5 },
      { productId: 3, score: 3 },
    ]);
    getByIds.mockResolvedValue([{ id: 1 }]);
    const result = await service.search({
      query: 'pen',
      locale: 'en',
      limit: 1,
      offset: 0,
      sort: 'price',
    } as never);
    expect(getByIds).toHaveBeenCalledWith([1], 'en');
    expect(result.total).toBe(3);
  });

  it('reduces the total by ids that vanished before hydration', async () => {
    executeCatalogScoredSearchRaw.mockResolvedValue([
      { productId: 1, score: 2 },
      { productId: 2, score: 1 },
    ]);
    getByIds.mockResolvedValue([{ id: 1 }]);
    const result = await service.search({ query: 'pen', locale: 'en' } as never);
    expect(result).toEqual({ items: [{ id: 1 }], total: 1 });
  });

  it('returns an empty result and logs when nothing matches', async () => {
    executeCatalogScoredSearchRaw.mockResolvedValue([]);
    const result = await service.search({ query: 'zzz', locale: 'en' } as never);
    expect(result).toEqual({ items: [], total: 0 });
    expect(logCatalogSearchRaw).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'zzz', resultsCount: 0 }),
    );
  });

  it('searches Arabic terms with normalised spelling', async () => {
    executeCatalogScoredSearchRaw.mockResolvedValue([]);
    await service.search({ query: 'القلم', locale: 'ar' } as never);
    expect(executeCatalogScoredSearchRaw).toHaveBeenCalledWith(
      expect.objectContaining({ normalizedTerm: 'قلم', locale: 'ar' }),
    );
  });

  it('merges scores for a mixed Arabic and English query', async () => {
    executeCatalogScoredSearchRaw
      .mockResolvedValueOnce([{ productId: 1, score: 2 }])
      .mockResolvedValueOnce([
        { productId: 1, score: 3 },
        { productId: 2, score: 1 },
      ]);
    getByIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.search({ query: 'قلم pen', locale: 'ar' } as never);
    expect(getByIds).toHaveBeenCalledWith([1, 2], 'ar');
    expect(result.total).toBe(2);
  });

  it('returns no suggestions for a blank query and maps suggestions otherwise', async () => {
    expect(await service.suggest('  ', 'en')).toEqual({ products: [], categories: [] });

    getCatalogSuggestionsRaw.mockResolvedValue({
      products: [{ id: 1, name: 'Pen', imageUrl: '/p.png' }],
      categories: [{ id: 2, name: 'Pens', slug: 'pens' }],
    });
    const suggestions = await service.suggest('Pen', 'en');
    expect(suggestions.products).toEqual([
      { id: 1, name: 'Pen', type: 'product', imageUrl: '/p.png' },
    ]);
    expect(suggestions.categories).toEqual([
      { id: 2, name: 'Pens', slug: 'pens', type: 'category' },
    ]);
    expect(getCatalogSuggestionsRaw).toHaveBeenCalledWith(
      expect.objectContaining({ normalizedTerm: 'pen' }),
    );
  });

  it('normalises Arabic suggestion input', async () => {
    getCatalogSuggestionsRaw.mockResolvedValue({ products: [], categories: [] });
    await service.suggest('الأقلام', 'ar');
    expect(getCatalogSuggestionsRaw).toHaveBeenCalledWith(
      expect.objectContaining({ normalizedTerm: 'اقلام' }),
    );
  });
});
