import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCategoryDistributionQuery } from '../GetCategoryDistributionQuery';
import { getCategoryDistributionRaw } from '@findeg/db/queries';
import { QueryError } from '../../../../core/domain/errors/QueryError';

vi.mock('@findeg/db/queries', () => ({
  getCategoryDistributionRaw: vi.fn(),
}));

describe('GetCategoryDistributionQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should map raw category distribution to application DTO', async () => {
    vi.mocked(getCategoryDistributionRaw).mockResolvedValue([
      {
        categoryId: 'cat-1',
        localizedName: { en: 'Category 1', ar: 'فئة 1' },
        slug: 'cat-1',
        productCount: 40,
      },
      {
        categoryId: 'cat-2',
        localizedName: null,
        slug: 'cat-2',
        productCount: 60,
      },
    ]);

    const query = new GetCategoryDistributionQuery();
    const result = await query.execute(5);

    expect(getCategoryDistributionRaw).toHaveBeenCalledWith(5);
    expect(result).toEqual([
      {
        categoryId: 'cat-1',
        categoryName: 'Category 1',
        productCount: 40,
        percentage: 40,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'cat-2',
        productCount: 60,
        percentage: 60,
      },
    ]);
  });

  it('should throw QueryError when underlying DB call fails', async () => {
    vi.mocked(getCategoryDistributionRaw).mockRejectedValue(new Error('DB Query Failed'));

    const query = new GetCategoryDistributionQuery();

    await expect(query.execute()).rejects.toThrow(QueryError);
    await expect(query.execute()).rejects.toThrow(
      'Failed to retrieve category distribution: DB Query Failed',
    );
  });
});
