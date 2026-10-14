import { DEFAULT_CURRENCY, BUSINESS_TIME_ZONE } from '@findeg/domain';
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalBrands: number;
  totalRevenue: bigint;
  currency: typeof DEFAULT_CURRENCY;
  timezone: typeof BUSINESS_TIME_ZONE;
  ordersByStatus: Record<import('@findeg/orders/types').OrderStatus, number>;
  lowStockCount: number;
  todayRevenue: bigint;
  todayOrders: number;
  topProducts: {
    id: number;
    name: string;
    sold: number;
    revenue: bigint;
  }[];
  revenueByPeriod: {
    date: string;
    revenue: bigint;
  }[];
}
