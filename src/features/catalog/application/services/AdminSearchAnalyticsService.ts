import { IAdminSearchAnalyticsRepository } from "../interfaces/IAdminSearchAnalyticsRepository";
import { IAdminSearchAnalyticsService } from "../interfaces/IAdminSearchAnalyticsService";
import {
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from "../interfaces/IAdminSearchAnalyticsRepository";

export class AdminSearchAnalyticsService implements IAdminSearchAnalyticsService {
  constructor(private repository: IAdminSearchAnalyticsRepository) {}

  async getMetrics(days?: number): Promise<SearchAnalyticsMetrics> {
    return this.repository.getMetrics(days);
  }

  async getTopSearches(days?: number, limit?: number): Promise<TopSearchQuery[]> {
    return this.repository.getTopSearches(days, limit);
  }

  async getZeroResultSearches(days?: number, limit?: number): Promise<ZeroResultSearch[]> {
    return this.repository.getZeroResultSearches(days, limit);
  }

  async getLowCTRSearches(
    days?: number,
    limit?: number,
    minImpressions?: number,
  ): Promise<LowCTRSearch[]> {
    return this.repository.getLowCTRSearches(days, limit, minImpressions);
  }

  async getLanguageBreakdown(days?: number): Promise<LanguageBreakdown[]> {
    return this.repository.getLanguageBreakdown(days);
  }
}
