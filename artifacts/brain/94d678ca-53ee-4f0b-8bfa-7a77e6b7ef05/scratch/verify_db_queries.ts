import { getDashboardKpisRaw, getLowStockCountRaw, getTopProductsRaw } from "../../../../db/queries/dashboard.js";
import { startOfDay, endOfDay } from "date-fns";

async function verify() {
  console.log("🚀 Starting DB Query Verification...");
  
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    console.log("📊 Fetching KPIs...");
    const kpis = await getDashboardKpisRaw(todayStart, todayEnd);
    console.log("✅ KPIs:", JSON.stringify(kpis, null, 2));

    console.log("📉 Fetching Low Stock Count...");
    const lowStock = await getLowStockCountRaw();
    console.log("✅ Low Stock Count:", lowStock);

    console.log("🏆 Fetching Top Products...");
    const topProducts = await getTopProductsRaw(5);
    console.log("✅ Top Products:", JSON.stringify(topProducts, null, 2));

    console.log("✨ Verification Complete!");
  } catch (error) {
    console.error("❌ Verification Failed:", error);
    process.exit(1);
  }
}

verify();
