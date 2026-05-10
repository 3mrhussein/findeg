import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { GetCatalogHealthQuery } from '../GetCatalogHealthQuery';
import { getCatalogHealthRaw } from '@findeg/db/queries';
import { ICategoryRepository } from '../../../../catalog/application/interfaces/ICategoryRepository';
import { IBrandRepository } from '../../../../catalog/application/interfaces/IBrandRepository';
import { QueryError } from '../../../../core/domain/errors/QueryError';

vi.mock('@findeg/db/queries', () => ({
  getCatalogHealthRaw: vi.fn(),
}));

describe('GetCatalogHealthQuery', () => {
  let categoryRepository: Mocked<ICategoryRepository>;
  let brandRepository: Mocked<IBrandRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    categoryRepository = {
      count: vi.fn(),
    } as unknown as Mocked<ICategoryRepository>;
    brandRepository = {
      count: vi.fn(),
    } as unknown as Mocked<IBrandRepository>;
  });

  it('should return catalog health stats successfully', async () => {
    vi.mocked(getCatalogHealthRaw).mockResolvedValue({
      totalProducts: 100,
      missingCategory: 5,
      missingImages: 10,
      missingPrice: 2,
      draftProducts: 20,
      fullyComplete: 63,
    });
    categoryRepository.count.mockResolvedValue(10);
    brandRepository.count.mockResolvedValue(5);

    const query = new GetCatalogHealthQuery(categoryRepository, brandRepository);
    const result = await query.execute();

    expect(result).toEqual({
      totalProducts: 100,
      missingCategory: 5,
      missingImages: 10,
      missingPrice: 2,
      draftProducts: 20,
      fullyComplete: 63,
      totalCategories: 10,
      totalBrands: 5,
    });

    expect(getCatalogHealthRaw).toHaveBeenCalledTimes(1);
    expect(categoryRepository.count).toHaveBeenCalledTimes(1);
    expect(brandRepository.count).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined brandRepository', async () => {
    vi.mocked(getCatalogHealthRaw).mockResolvedValue({
      totalProducts: 10,
      missingCategory: 0,
      missingImages: 0,
      missingPrice: 0,
      draftProducts: 0,
      fullyComplete: 10,
    });
    categoryRepository.count.mockResolvedValue(5);

    const query = new GetCatalogHealthQuery(categoryRepository);
    const result = await query.execute();

    expect(result.totalBrands).toBe(0);
    expect(brandRepository.count).not.toHaveBeenCalled();
  });

  it('should throw QueryError when underlying DB call fails', async () => {
    vi.mocked(getCatalogHealthRaw).mockRejectedValue(new Error('DB Connection Failed'));

    const query = new GetCatalogHealthQuery(categoryRepository, brandRepository);

    await expect(query.execute()).rejects.toThrow(QueryError);
    await expect(query.execute()).rejects.toThrow(
      'Failed to retrieve catalog health stats: DB Connection Failed',
    );
  });
});
