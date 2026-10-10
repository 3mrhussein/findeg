import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCatalogHealthRaw,
  getCategoryDistributionRaw,
  getProductCountRaw,
  getCategoryCountRaw,
  getBrandCountRaw,
  getLowStockCountRaw,
} from '@findeg/db/queries';
import { AdminDashboardService } from '../AdminDashboardService';
import { QueryError } from '../../../../core/domain/errors/QueryError';

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

const { getStats } = vi.hoisted(() => ({ getStats: vi.fn() }));
vi.mock('@findeg/orders', () => ({ createOrders: () => ({ getStats }) }));

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminDashboardService();
  });

  it('retrieves and aggregates dashboard statistics', async () => {
    vi.mocked(getProductCountRaw).mockResolvedValue(100);
    vi.mocked(getCategoryCountRaw).mockResolvedValue(10);
    vi.mocked(getBrandCountRaw).mockResolvedValue(5);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(3);
    getStats.mockResolvedValue({
      totalOrders: 150,
      totalRevenue: 500000n,
      todayOrders: 2,
      todayRevenue: 20000n,
      timezone: 'Africa/Cairo',
      ordersByStatus: { pending: 150 },
      topProducts: [{ id: 1, name: 'Product 1', sold: 10, revenue: 100000n }],
      revenueByPeriod: [
        { date: '2026-05-01', revenue: 15000n },
        { date: '2026-05-02', revenue: 20000n },
      ],
    });

    const result = await service.getDashboardStats();

    expect(getProductCountRaw).toHaveBeenCalledTimes(1);
    expect(getCategoryCountRaw).toHaveBeenCalledTimes(1);
    expect(getBrandCountRaw).toHaveBeenCalledTimes(1);
    expect(getLowStockCountRaw).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      totalProducts: 100,
      totalCategories: 10,
      totalBrands: 5,
      totalOrders: 150,
      totalRevenue: 500000n,
      todayRevenue: 20000n,
      todayOrders: 2,
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      ordersByStatus: { pending: 150 },
      lowStockCount: 3,
      topProducts: [{ id: 1, name: 'Product 1', sold: 10, revenue: 100000n }],
      revenueByPeriod: [
        { date: '2026-05-01', revenue: 15000n },
        { date: '2026-05-02', revenue: 20000n },
      ],
    });
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

  it('wraps dashboard stat failures in QueryError', async () => {
    vi.mocked(getProductCountRaw).mockRejectedValue(new Error('Count Failed'));
    vi.mocked(getCategoryCountRaw).mockResolvedValue(0);
    vi.mocked(getBrandCountRaw).mockResolvedValue(0);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(0);

    await expect(service.getDashboardStats()).rejects.toThrow(QueryError);
    await expect(service.getDashboardStats()).rejects.toThrow(
      'Failed to retrieve dashboard stats: Count Failed',
    );
  });
});
