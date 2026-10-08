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
}));

const { getStats, recent } = vi.hoisted(() => ({ getStats: vi.fn(), recent: vi.fn() }));

vi.mock('../../../../order', () => ({
  createOrders: () => ({ getStats, recent }),
}));

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminDashboardService();
  });

  it('combines catalog metrics with exact Order statistics', async () => {
    vi.mocked(getProductCountRaw).mockResolvedValue(100);
    vi.mocked(getCategoryCountRaw).mockResolvedValue(10);
    vi.mocked(getBrandCountRaw).mockResolvedValue(5);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(3);
    getStats.mockResolvedValue({
      totalOrders: 150,
      totalRevenue: 500001n,
      todayOrders: 2,
      todayRevenue: 20003n,
      currency: 'EGP',
      topProducts: [{ id: 1, name: 'Product 1', sold: 10, revenue: 100007n }],
      revenueByPeriod: [
        { date: '2026-05-01', revenue: 15001n },
        { date: '2026-05-02', revenue: 20003n },
      ],
    });

    expect(await service.getDashboardStats()).toEqual({
      totalProducts: 100,
      totalCategories: 10,
      totalBrands: 5,
      totalOrders: 150,
      totalRevenue: 500001n,
      todayRevenue: 20003n,
      todayOrders: 2,
      currency: 'EGP',
      lowStockCount: 3,
      topProducts: [{ id: 1, name: 'Product 1', sold: 10, revenue: 100007n }],
      revenueByPeriod: [
        { date: '2026-05-01', revenue: 15001n },
        { date: '2026-05-02', revenue: 20003n },
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

  it('retrieves recent Orders through the public module', async () => {
    recent.mockResolvedValue([]);

    await service.getRecentOrders(7);

    expect(recent).toHaveBeenCalledWith(7);
  });

  it('wraps dashboard stat failures in QueryError', async () => {
    vi.mocked(getProductCountRaw).mockRejectedValue(new Error('Count Failed'));
    vi.mocked(getCategoryCountRaw).mockResolvedValue(0);
    vi.mocked(getBrandCountRaw).mockResolvedValue(0);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(0);
    getStats.mockResolvedValue({});

    await expect(service.getDashboardStats()).rejects.toThrow(QueryError);
    await expect(service.getDashboardStats()).rejects.toThrow(
      'Failed to retrieve dashboard stats: Count Failed',
    );
  });
});
