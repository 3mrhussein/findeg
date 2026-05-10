import { DashboardStats } from '../../domain/types/DashboardStats';
import {
  getDashboardKpisRaw,
  getRevenueByPeriodRaw,
  getLowStockCountRaw,
  getTopProductsRaw,
} from '@findeg/db/queries';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { QueryError } from '../../../core/domain/errors/QueryError';

/**
 * Query to retrieve main dashboard statistics.
 * Aggregates revenue, order volume, and catalog status.
 */
export class GetDashboardStatsQuery {
  async execute(): Promise<DashboardStats> {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      const thirtyDaysAgo = subDays(new Date(), 30);

      const [kpis, revenueByPeriod, lowStockCount, topProducts] = await Promise.all([
        getDashboardKpisRaw(todayStart, todayEnd),
        getRevenueByPeriodRaw(thirtyDaysAgo, new Date(), 'day'),
        getLowStockCountRaw(),
        getTopProductsRaw(5),
      ]);

      return {
        ...kpis,
        currency: 'EGP',
        lowStockCount,
        topProducts,
        revenueByPeriod: revenueByPeriod.map((r) => ({
          date: r.period,
          revenue: r.revenue,
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve dashboard stats: ${error.message}`);
      }
      throw error;
    }
  }
}
