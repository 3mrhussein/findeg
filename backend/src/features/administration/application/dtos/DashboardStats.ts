export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalBrands: number;
  totalRevenue: number;
  currency: string;
  lowStockCount: number;
  todayRevenue: number;
  todayOrders: number;
  topProducts: {
    id: number;
    name: string;
    sold: number;
    revenue: number;
  }[];
  revenueByPeriod: {
    date: string;
    revenue: number;
  }[];
}