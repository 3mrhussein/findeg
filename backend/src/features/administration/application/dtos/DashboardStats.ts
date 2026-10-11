export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalBrands: number;
  totalRevenue: bigint;
  currency: 'EGP';
  timezone: 'Africa/Cairo';
  ordersByStatus: Record<import('@findeg/orders/schemas').OrderStatus, number>;
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
