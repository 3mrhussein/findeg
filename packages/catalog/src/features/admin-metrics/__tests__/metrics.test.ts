import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCatalogHealthRaw,
  getCategoryDistributionRaw,
  getProductCountRaw,
  getCategoryCountRaw,
  getBrandCountRaw,
} from '@findeg/db/queries';
import { AdminCatalogMetrics } from '../index';
import { QueryError } from '../helpers';

vi.mock('@findeg/db/queries', () => ({
  getCatalogHealthRaw: vi.fn(),
  getCategoryDistributionRaw: vi.fn(),
  getProductCountRaw: vi.fn(),
  getCategoryCountRaw: vi.fn(),
  getBrandCountRaw: vi.fn(),
  getLowStockCountRaw: vi.fn(),
  orderQueries: {
    getRecent: vi.fn(),
  },
}));

describe('Catalog metrics', () => {
  let service: AdminCatalogMetrics;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminCatalogMetrics();
  });
  it('returns catalog health stats directly from db queries', async () => {
    vi.mocked(getCatalogHealthRaw).mockResolvedValue({
      totalProducts: 100,
      totalCategories: 10,
      totalBrands: 5,
      missingCategory: 5,
      missingImages: 10,
      missingPrice: 2,
      draftProducts: 20,
      fullyComplete: 63,
    });

    await expect(service.getCatalogHealthStats()).resolves.toEqual({
      totalProducts: 100,
      totalCategories: 10,
      totalBrands: 5,
      missingCategory: 5,
      missingImages: 10,
      missingPrice: 2,
      draftProducts: 20,
      fullyComplete: 63,
    });
  });

  it('maps category distribution for dashboard consumption', async () => {
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

    await expect(service.getCategoryProductDistribution()).resolves.toEqual([
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
  it('reports catalog counts independently of Orders and Inventory', async () => {
    vi.mocked(getProductCountRaw).mockResolvedValue(7);
    vi.mocked(getCategoryCountRaw).mockResolvedValue(3);
    vi.mocked(getBrandCountRaw).mockResolvedValue(2);
    await expect(service.getCounts()).resolves.toEqual({
      totalProducts: 7,
      totalCategories: 3,
      totalBrands: 2,
    });
  });
  it('preserves query failures and wraps database errors for catalog health', async () => {
    vi.mocked(getCatalogHealthRaw).mockRejectedValue(new Error('offline'));
    await expect(service.getCatalogHealthStats()).rejects.toThrow(QueryError);
    await expect(service.getCatalogHealthStats()).rejects.toThrow(
      'Failed to retrieve catalog health stats: offline',
    );
    vi.mocked(getCatalogHealthRaw).mockRejectedValue('unavailable');
    await expect(service.getCatalogHealthStats()).rejects.toBe('unavailable');
  });
  it('preserves query failures and wraps database errors for distribution', async () => {
    vi.mocked(getCategoryDistributionRaw).mockRejectedValue(new Error('offline'));
    await expect(service.getCategoryProductDistribution()).rejects.toThrow(
      'Failed to retrieve category distribution: offline',
    );
    vi.mocked(getCategoryDistributionRaw).mockRejectedValue('unavailable');
    await expect(service.getCategoryProductDistribution()).rejects.toBe('unavailable');
  });
  it('shows unnamed empty categories without dividing by zero', async () => {
    vi.mocked(getCategoryDistributionRaw).mockResolvedValue([
      { categoryId: 'empty', localizedName: {}, slug: '', productCount: 0 },
    ]);
    await expect(service.getCategoryProductDistribution()).resolves.toEqual([
      { categoryId: 'empty', categoryName: 'Unknown', productCount: 0, percentage: 0 },
    ]);
  });
});
