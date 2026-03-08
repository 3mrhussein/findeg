import { db } from "@/features/core/infrastructure/persistence";
import { searchLogs } from "@/features/core/infrastructure/persistence/schema/search-logs";
import { products } from "@/features/core/infrastructure/persistence/schema/products";
import {
  IAdminSearchAnalyticsRepository,
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from "../../application/interfaces/IAdminSearchAnalyticsRepository";
import { eq, and, gte, desc, sql, count, avg, sum } from "drizzle-orm";

/**
 *
 */
export class DrizzleAdminSearchAnalyticsRepository implements IAdminSearchAnalyticsRepository {
  /**
   *
   */
  private getStartDate(days?: number): Date | null {
    if (!days) return null;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   *
   */
  async getMetrics(days?: number): Promise<SearchAnalyticsMetrics> {
    const startDate = this.getStartDate(days);
    const whereClause = startDate ? gte(searchLogs.createdAt, startDate) : undefined;

    const [result] = await db
      .select({
        total: sql<number>`count(*)`,
        zeroResults: sql<number>`count(case when ${searchLogs.resultsCount} = 0 then 1 end)`,
        avgResults: sql<number>`avg(${searchLogs.resultsCount})`,
        clicks: sql<number>`count(case when ${searchLogs.clickedProductId} is not null then 1 end)`,
      })
      .from(searchLogs)
      .where(whereClause);

    const totalSearches = Number(result?.total || 0);
    const zeroResultsCount = Number(result?.zeroResults || 0);
    const clicks = Number(result?.clicks || 0);

    return {
      totalSearches,
      zeroResultsCount,
      zeroResultsRate: totalSearches > 0 ? (zeroResultsCount / totalSearches) * 100 : 0,
      avgResultsPerSearch: Number(result?.avgResults || 0),
      clickThroughRate: totalSearches > 0 ? (clicks / totalSearches) * 100 : 0,
    };
  }

  /**
   *
   */
  async getTopSearches(days?: number, limit: number = 50): Promise<TopSearchQuery[]> {
    const startDate = this.getStartDate(days);
    const whereClause = startDate ? gte(searchLogs.createdAt, startDate) : undefined;

    const results = await db
      .select({
        query: searchLogs.query,
        count: sql<number>`count(*)`,
        avgResults: sql<number>`avg(${searchLogs.resultsCount})`,
        clicks: sql<number>`count(case when ${searchLogs.clickedProductId} is not null then 1 end)`,
      })
      .from(searchLogs)
      .where(whereClause)
      .groupBy(searchLogs.query)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return results.map((row, index) => ({
      rank: index + 1,
      query: row.query,
      count: Number(row.count),
      avgResults: Number(row.avgResults),
      clickRate: Number(row.count) > 0 ? (Number(row.clicks) / Number(row.count)) * 100 : 0,
    }));
  }

  /**
   *
   */
  async getZeroResultSearches(days?: number, limit: number = 50): Promise<ZeroResultSearch[]> {
    const startDate = this.getStartDate(days);
    const filters = [eq(searchLogs.resultsCount, 0)];
    if (startDate) filters.push(gte(searchLogs.createdAt, startDate));

    const results = await db
      .select({
        query: searchLogs.query,
        count: sql<number>`count(*)`,
        lastSearchedAt: sql<Date>`max(${searchLogs.createdAt})`,
        locale: searchLogs.locale,
      })
      .from(searchLogs)
      .where(and(...filters))
      .groupBy(searchLogs.query, searchLogs.locale)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return results.map((row) => ({
      query: row.query,
      count: Number(row.count),
      lastSearchedAt: new Date(row.lastSearchedAt),
      locale: row.locale,
    }));
  }

  /**
   *
   */
  async getLowCTRSearches(
    days?: number,
    limit: number = 50,
    minImpressions: number = 10,
  ): Promise<LowCTRSearch[]> {
    const startDate = this.getStartDate(days);
    const whereClause = startDate ? gte(searchLogs.createdAt, startDate) : undefined;

    const results = await db
      .select({
        query: searchLogs.query,
        impressions: sql<number>`count(*)`,
        clicks: sql<number>`count(case when ${searchLogs.clickedProductId} is not null then 1 end)`,
      })
      .from(searchLogs)
      .where(whereClause)
      .groupBy(searchLogs.query)
      .having(sql`count(*) >= ${minImpressions}`)
      .orderBy(
        sql`(count(case when ${searchLogs.clickedProductId} is not null then 1 end)::float / count(*)) ASC`,
      )
      .limit(limit);

    return results
      .map((row) => ({
        query: row.query,
        impressions: Number(row.impressions),
        clicks: Number(row.clicks),
        ctr: (Number(row.clicks) / Number(row.impressions)) * 100,
      }))
      .filter((r) => r.ctr < 10);
  }

  /**
   *
   */
  async getLanguageBreakdown(days?: number): Promise<LanguageBreakdown[]> {
    const startDate = this.getStartDate(days);
    const whereClause = startDate ? gte(searchLogs.createdAt, startDate) : undefined;

    const totalResult = await db.select({ total: count() }).from(searchLogs).where(whereClause);

    // @ts-ignore - Drizzle aggregation types can be tricky, but we know it returns total
    const total = totalResult[0]?.total || 0;
    if (total === 0) return [];

    const results = await db
      .select({
        locale: searchLogs.locale,
        count: count(),
      })
      .from(searchLogs)
      .where(whereClause)
      .groupBy(searchLogs.locale);

    return results.map((row) => ({
      locale: row.locale,
      count: row.count,
      percentage: (row.count / total) * 100,
    }));
  }
}
