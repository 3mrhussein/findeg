export interface SearchAnalyticsMetrics {
  totalSearches: number;
  zeroResultsCount: number;
  zeroResultsRate: number;
  avgResultsPerSearch: number;
  clickThroughRate: number;
}

export interface TopSearchQuery {
  rank: number;
  query: string;
  count: number;
  avgResults: number;
  clickRate: number;
  topClickedProductId?: number | null;
  topClickedProductName?: string | null;
}

export interface ZeroResultSearch {
  query: string;
  count: number;
  lastSearchedAt: Date;
  locale: string;
}

export interface LowCTRSearch {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface LanguageBreakdown {
  locale: string;
  count: number;
  percentage: number;
}

export interface IAdminSearchAnalyticsRepository {
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
