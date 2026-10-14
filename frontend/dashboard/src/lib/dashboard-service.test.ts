import { beforeEach, describe, expect, it, vi } from 'vitest';

const ports = vi.hoisted(() => ({
  counts: vi.fn(),
  lowStock: vi.fn(),
  stats: vi.fn(),
  recent: vi.fn(),
}));
vi.mock('@findeg/catalog', () => ({
  AdminCatalogMetrics: class {
    getCounts = ports.counts;
  },
  QueryError: Error,
}));
vi.mock('@findeg/inventory', () => ({ getInventoryLowStockCount: ports.lowStock }));
vi.mock('@findeg/orders', () => ({
  createOrders: () => ({ getStats: ports.stats, recent: ports.recent }),
}));
import { AdminDashboardService } from './dashboard-service';

describe('Dashboard context composition', () => {
  beforeEach(() => vi.resetAllMocks());
  it('combines catalog, inventory and Orders metrics without changing monetary values', async () => {
    ports.counts.mockResolvedValue({ totalProducts: 100, totalCategories: 10, totalBrands: 5 });
    ports.lowStock.mockResolvedValue(3);
    ports.stats.mockResolvedValue({
      totalOrders: 150,
      totalRevenue: 500000n,
      todayRevenue: 20000n,
      todayOrders: 2,
      timezone: 'Africa/Cairo',
      ordersByStatus: { pending: 2 },
      topProducts: [],
      revenueByPeriod: [],
    });
    await expect(new AdminDashboardService().getDashboardStats()).resolves.toEqual({
      totalProducts: 100,
      totalCategories: 10,
      totalBrands: 5,
      totalOrders: 150,
      totalRevenue: 500000n,
      todayRevenue: 20000n,
      todayOrders: 2,
      lowStockCount: 3,
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      ordersByStatus: { pending: 2 },
      topProducts: [],
      revenueByPeriod: [],
    });
  });
  it('reports an unavailable context rather than showing partial totals', async () => {
    ports.counts.mockRejectedValue(new Error('Count Failed'));
    await expect(new AdminDashboardService().getDashboardStats()).rejects.toThrow(
      'Failed to retrieve dashboard stats: Count Failed',
    );
  });
  it('retrieves recent Orders from the Orders context', async () => {
    ports.recent.mockResolvedValue([{ id: 42 }]);
    await expect(new AdminDashboardService().getRecentOrders()).resolves.toEqual([{ id: 42 }]);
  });
});
