import {
  getCatalogHealthRaw,
  getCategoryDistributionRaw,
  getProductCountRaw,
  getCategoryCountRaw,
  getBrandCountRaw,
  getLowStockCountRaw,
  getRevenueByPeriodRaw,
  getTopProductsRaw,
  getTotalOrderStatsRaw,
  getOrderStatsRaw,
} from "./src/queries";
// Removed date-fns imports

async function verify() {
  console.log("🚀 Starting DB Query Verification...");

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    console.log("📊 Fetching KPI Primitives...");
    const [productCount, categoryCount, brandCount, totalStats, todayStats] = await Promise.all([
      getProductCountRaw(),
      getCategoryCountRaw(),
      getBrandCountRaw(),
      getTotalOrderStatsRaw(),
      getOrderStatsRaw(todayStart, todayEnd),
    ]);
    console.log("✅ KPIs:", JSON.stringify({
      totalProducts: productCount,
      totalCategories: categoryCount,
      totalBrands: brandCount,
      totalOrders: totalStats.totalOrders,
      totalRevenue: totalStats.totalRevenue,
      todayOrders: todayStats.totalOrders,
      todayRevenue: todayStats.totalRevenue,
    }, null, 2));

    console.log("📉 Fetching Low Stock Count...");
    const lowStock = await getLowStockCountRaw();
    console.log("✅ Low Stock Count:", lowStock);

    console.log("🏆 Fetching Top Products...");
    const topProducts = await getTopProductsRaw(5);
    console.log("✅ Top Products:", JSON.stringify(topProducts, null, 2));

    console.log("📂 Fetching Category Distribution...");
    const categoryDistribution = await getCategoryDistributionRaw();
    console.log("✅ Category Distribution:", JSON.stringify(categoryDistribution, null, 2));

    console.log("✨ Verification Complete!");
  } catch (error) {
    console.error("❌ Verification Failed:", error);
    process.exit(1);
  }
}

verify();
