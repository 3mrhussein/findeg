import { adminSearchAnalyticsQueries } from '@findeg/db/queries';
import { IAdminSearchAnalyticsService } from '../interfaces/IAdminSearchAnalyticsService';
import {
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from '../interfaces/IAdminSearchAnalyticsRepository';

export class AdminSearchAnalyticsService implements IAdminSearchAnalyticsService {
  async getMetrics(days?: number): Promise<SearchAnalyticsMetrics> {
    return adminSearchAnalyticsQueries.getMetrics(days);
  }

  async getTopSearches(days?: number, limit?: number): Promise<TopSearchQuery[]> {
    return adminSearchAnalyticsQueries.getTopSearches(days, limit);
  }

  async getZeroResultSearches(days?: number, limit?: number): Promise<ZeroResultSearch[]> {
    return adminSearchAnalyticsQueries.getZeroResultSearches(days, limit);
  }

  async getLowCTRSearches(
    days?: number,
    limit?: number,
    minImpressions?: number,
  ): Promise<LowCTRSearch[]> {
    return adminSearchAnalyticsQueries.getLowCTRSearches(days, limit, minImpressions);
  }

  async getLanguageBreakdown(days?: number): Promise<LanguageBreakdown[]> {
    return adminSearchAnalyticsQueries.getLanguageBreakdown(days);
  }
}
