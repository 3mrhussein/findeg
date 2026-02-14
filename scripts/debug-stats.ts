import { container } from "../src/infrastructure/di/ServiceContainer";
import { startOfDay, endOfDay, subDays } from "date-fns";

/**
 *
 */
async function main() {
  console.log("Starting debug-stats...");
  try {
    console.log("Fetching dashboard stats...");
    const stats = await container.adminDashboardService.getDashboardStats();
    console.log("Stats fetched successfully:", stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
  }
}

main().catch(console.error);
