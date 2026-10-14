import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSearchAnalyticsService } from '../index';

const { adminSearchAnalyticsQueries } = vi.hoisted(() => ({
  adminSearchAnalyticsQueries: {
    getMetrics: vi.fn(),
    getTopSearches: vi.fn(),
    getZeroResultSearches: vi.fn(),
    getLowCTRSearches: vi.fn(),
    getLanguageBreakdown: vi.fn(),
  },
}));
vi.mock('@findeg/db/queries', () => ({ adminSearchAnalyticsQueries }));

describe('AdminSearchAnalyticsService', () => {
  let service: AdminSearchAnalyticsService;
  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminSearchAnalyticsService();
  });

  it('delegates each report to the analytics queries with the given window', async () => {
    adminSearchAnalyticsQueries.getMetrics.mockResolvedValue({ searches: 1 });
    adminSearchAnalyticsQueries.getTopSearches.mockResolvedValue([{ q: 'pen' }]);
    adminSearchAnalyticsQueries.getZeroResultSearches.mockResolvedValue([{ q: 'x' }]);
    adminSearchAnalyticsQueries.getLowCTRSearches.mockResolvedValue([{ q: 'y' }]);
    adminSearchAnalyticsQueries.getLanguageBreakdown.mockResolvedValue([{ locale: 'ar' }]);

    expect(await service.getMetrics(7)).toEqual({ searches: 1 });
    expect(await service.getTopSearches(7, 5)).toEqual([{ q: 'pen' }]);
    expect(await service.getZeroResultSearches(7, 3)).toEqual([{ q: 'x' }]);
    expect(await service.getLowCTRSearches(7, 3, 20)).toEqual([{ q: 'y' }]);
    expect(await service.getLanguageBreakdown(7)).toEqual([{ locale: 'ar' }]);
    expect(adminSearchAnalyticsQueries.getLowCTRSearches).toHaveBeenCalledWith(7, 3, 20);
  });
});
