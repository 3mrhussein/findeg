import { getDashboardKpisRaw, getLowStockCountRaw, getTopProductsRaw } from "./queries/dashboard";
// Removed date-fns imports

async function verify() {
  console.log("🚀 Starting DB Query Verification...");
  
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    console.log("📊 Fetching KPIs...");
    const kpis = await getDashboardKpisRaw(todayStart, todayEnd);
    console.log("✅ KPIs:", JSON.stringify(kpis, null, 2));

    console.log("📉 Fetching Low Stock Count...");
    const lowStock = await getLowStockCountRaw();
    console.log("✅ Low Stock Count:", lowStock);

    console.log("🏆 Fetching Top Products...");
    const topProducts = await getTopProductsRaw(5);
    console.log("✅ Top Products:", JSON.stringify(topProducts, null, 2));

    console.log("📂 Fetching Category Distribution...");
    const { getCategoryDistributionRaw } = await import("./queries/dashboard");
    const categoryDistribution = await getCategoryDistributionRaw();
    console.log("✅ Category Distribution:", JSON.stringify(categoryDistribution, null, 2));

    console.log("✨ Verification Complete!");
  } catch (error) {
    console.error("❌ Verification Failed:", error);
    process.exit(1);
  }
}

verify();
