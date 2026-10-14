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

describe('SearchService logging and edge cases', () => {
  let service: SearchService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new SearchService();
  });
  afterEach(() => vi.restoreAllMocks());

  it('keeps searching when logging fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    logCatalogSearchRaw.mockRejectedValue(new Error('log down'));
    executeCatalogScoredSearchRaw.mockResolvedValue([]);
    const result = await service.search({ query: 'pen', locale: 'en' } as never);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result).toEqual({ items: [], total: 0 });
    expect(error).toHaveBeenCalledWith('[SearchService] Failed to log search:', expect.any(Error));
  });

  it('does not log a whitespace-only query and skips scoring for empty terms', async () => {
    getFilteredProducts.mockResolvedValue({ products: [], total: 0 });
    await service.search({ query: '   ', locale: 'en' } as never);
    expect(logCatalogSearchRaw).not.toHaveBeenCalled();
    expect(executeCatalogScoredSearchRaw).not.toHaveBeenCalled();
  });

  it('uses the filtered listing sort when the requested sort is relevance', async () => {
    getFilteredProducts.mockResolvedValue({ products: [], total: 0 });
    await service.search({ query: '', locale: 'en', sort: 'relevance' } as never);
    expect(getFilteredProducts).toHaveBeenCalledWith({ limit: 20, offset: 0, sort: undefined });
  });

  it('ranks ties and hydrates Arabic-only searches with the Arabic normaliser', async () => {
    executeCatalogScoredSearchRaw.mockResolvedValue([
      { productId: 1, score: 1 },
      { productId: 2, score: 1 },
    ]);
    const getByIds = vi
      .spyOn(ProductService.prototype, 'getByIds')
      .mockResolvedValue([{ id: 2 }] as never);
    const result = await service.search({
      query: 'أَلْقَلَم',
      locale: 'ar',
      offset: 1,
      limit: 5,
    } as never);
    expect(getByIds).toHaveBeenCalledWith([2], 'ar');
    expect(result.total).toBe(2);
    expect(executeCatalogScoredSearchRaw).toHaveBeenCalledWith(
      expect.objectContaining({ normalizedTerm: expect.any(String) as unknown }),
    );
  });

  it('returns empty suggestions for a query with no matches', async () => {
    getCatalogSuggestionsRaw.mockResolvedValue({ products: [], categories: [] });
    expect(await service.suggest('zzz', 'en')).toEqual({ products: [], categories: [] });
  });
});
