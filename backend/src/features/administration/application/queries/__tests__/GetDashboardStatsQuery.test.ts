import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDashboardStatsQuery } from '../GetDashboardStatsQuery';
import {
  getDashboardKpisRaw,
  getRevenueByPeriodRaw,
  getLowStockCountRaw,
  getTopProductsRaw,
} from '@findeg/db/queries';
import { QueryError } from '../../../../core/domain/errors/QueryError';

vi.mock('@findeg/db/queries', () => ({
  getDashboardKpisRaw: vi.fn(),
  getRevenueByPeriodRaw: vi.fn(),
  getLowStockCountRaw: vi.fn(),
  getTopProductsRaw: vi.fn(),
}));

// Mock date-fns to have stable dates for tests without interfering with the rest of the application
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    startOfDay: vi.fn(() => new Date('2026-05-02T00:00:00.000Z')),
    endOfDay: vi.fn(() => new Date('2026-05-02T23:59:59.999Z')),
    subDays: vi.fn(() => new Date('2026-04-02T12:00:00.000Z')),
  };
});

describe('GetDashboardStatsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve and aggregate dashboard statistics', async () => {
    vi.mocked(getDashboardKpisRaw).mockResolvedValue({
      totalProducts: 100,
      totalCategories: 10,
      totalOrders: 50,
      totalBrands: 5,
      totalRevenue: 5000,
      todayRevenue: 200,
      todayOrders: 2,
    });
    vi.mocked(getRevenueByPeriodRaw).mockResolvedValue([
      { period: '2026-05-01', revenue: 150 },
      { period: '2026-05-02', revenue: 200 },
    ]);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(3);
    vi.mocked(getTopProductsRaw).mockResolvedValue([
      { id: 1, name: 'Product 1', sold: 10, revenue: 1000 },
    ]);

    const query = new GetDashboardStatsQuery();
    const result = await query.execute();

    expect(getDashboardKpisRaw).toHaveBeenCalledTimes(1);
    expect(getRevenueByPeriodRaw).toHaveBeenCalledTimes(1);
    expect(getLowStockCountRaw).toHaveBeenCalledTimes(1);
    expect(getTopProductsRaw).toHaveBeenCalledWith(5);

    expect(result).toEqual({
      totalProducts: 100,
      totalCategories: 10,
      totalOrders: 50,
      totalBrands: 5,
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

  it('should throw QueryError when an underlying DB call fails', async () => {
    vi.mocked(getDashboardKpisRaw).mockRejectedValue(new Error('Kpis Failed'));
    vi.mocked(getRevenueByPeriodRaw).mockResolvedValue([]);
    vi.mocked(getLowStockCountRaw).mockResolvedValue(0);
    vi.mocked(getTopProductsRaw).mockResolvedValue([]);

    const query = new GetDashboardStatsQuery();

    await expect(query.execute()).rejects.toThrow(QueryError);
    await expect(query.execute()).rejects.toThrow(
      'Failed to retrieve dashboard stats: Kpis Failed',
    );
  });
});
