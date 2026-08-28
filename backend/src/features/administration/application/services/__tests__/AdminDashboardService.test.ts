import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import {
  getCatalogHealthRaw,
  getCategoryDistributionRaw,
  getProductCountRaw,
  getCategoryCountRaw,
  getBrandCountRaw,
  getLowStockCountRaw,
  getRevenueByPeriodRaw,
  getTopProductsRaw,
  getTotalOrderStatsRaw,
  getOrderStatsRaw,
  orderQueries,
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
  getRevenueByPeriodRaw: vi.fn(),
  getTopProductsRaw: vi.fn(),
  getTotalOrderStatsRaw: vi.fn(),
  getOrderStatsRaw: vi.fn(),
  orderQueries: {
    getRecent: vi.fn(),
  },
}));

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();

  return {
    ...actual,
    startOfDay: vi.fn(() => new Date('2026-05-02T00:00:00.000Z')),
    endOfDay: vi.fn(() => new Date('2026-05-02T23:59:59.999Z')),
    subDays: vi.fn(() => new Date('2026-04-02T12:00:00.000Z')),
  };
});

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
    vi.mocked(getTotalOrderStatsRaw).mockResolvedValue({
      totalOrders: 150,
      totalRevenue: 5000,
    });
    vi.mocked(getOrderStatsRaw).mockResolvedValue({
      totalOrders: 2,
      totalRevenue: 200,
    });
    vi.mocked(getLowStockCountRaw).mockResolvedValue(3);
    vi.mocked(getRevenueByPeriodRaw).mockResolvedValue([
      { period: '2026-05-01', revenue: 150 },
      { period: '2026-05-02', revenue: 200 },
    ]);
    vi.mocked(getTopProductsRaw).mockResolvedValue([
      { id: 1, name: 'Product 1', sold: 10, revenue: 1000 },
    ]);

    const result = await service.getDashboardStats();

    expect(getProductCountRaw).toHaveBeenCalledTimes(1);
    expect(getCategoryCountRaw).toHaveBeenCalledTimes(1);
    expect(getBrandCountRaw).toHaveBeenCalledTimes(1);
    expect(getTotalOrderStatsRaw).toHaveBeenCalledTimes(1);
    expect(getOrderStatsRaw).toHaveBeenCalled();
    expect(getRevenueByPeriodRaw).toHaveBeenCalledTimes(1);
    expect(getLowStockCountRaw).toHaveBeenCalledTimes(1);
    expect(getTopProductsRaw).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      totalProducts: 100,
      totalCategories: 10,
      totalBrands: 5,
      totalOrders: 150,
      totalRevenue: 5000,
      todayRevenue: 200,
      todayOrders: 2,
      currency: 'EGP',
      lowStockCount: 3,
      topProducts: [{ id: 1, name: 'Product 1', sold: 10, revenue: 1000 }],
      revenueByPeriod: [
        { date: '2026-05-01', revenue: 150 },
        { date: '2026-05-02', revenue: 200 },
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

  it('delegates recent orders to the order queries', async () => {
    vi.mocked(orderQueries.getRecent).mockResolvedValue([]);

    await service.getRecentOrders(7);

    expect(vi.mocked(orderQueries.getRecent)).toHaveBeenCalledWith(7);
  });

  it('wraps dashboard stat failures in QueryError', async () => {
    vi.mocked(getProductCountRaw).mockRejectedValue(new Error('Count Failed'));
    vi.mocked(getCategoryCountRaw).mockResolvedValue(0);
    vi.mocked(getBrandCountRaw).mockResolvedValue(0);
    vi.mocked(getTotalOrderStatsRaw).mockResolvedValue({ totalOrders: 0, totalRevenue: 0 });
    vi.mocked(getOrderStatsRaw).mockResolvedValue({ totalOrders: 0, totalRevenue: 0 });
    vi.mocked(getRevenueByPeriodRaw).mockResolvedValue([]);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(0);
    vi.mocked(getTopProductsRaw).mockResolvedValue([]);

    await expect(service.getDashboardStats()).rejects.toThrow(QueryError);
    await expect(service.getDashboardStats()).rejects.toThrow(
      'Failed to retrieve dashboard stats: Count Failed',
    );
  });
});
