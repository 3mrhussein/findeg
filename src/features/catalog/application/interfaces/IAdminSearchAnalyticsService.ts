import {
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from "./IAdminSearchAnalyticsRepository";

export interface IAdminSearchAnalyticsService {
  getMetrics(days?: number): Promise<SearchAnalyticsMetrics>;
  getTopSearches(days?: number, limit?: number): Promise<TopSearchQuery[]>;
  getZeroResultSearches(days?: number, limit?: number): Promise<ZeroResultSearch[]>;
  getLowCTRSearches(
    days?: number,
    limit?: number,
    minImpressions?: number,
  ): Promise<LowCTRSearch[]>;
  getLanguageBreakdown(days?: number): Promise<LanguageBreakdown[]>;
}
