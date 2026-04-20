import env from "../env";
import { db, connection } from "./index";
import * as seeds from "./seeds";
import { truncateTables } from "./seeds/helpers";

if (!env.DB_SEEDING) {
  throw new Error("You must set DB_SEEDING to 'true' when running seeds.");
}

async function main() {
  console.log("🌱 Starting Database Seed Process...");
  const startedAt = Date.now();

  try {
    // 1. Truncate all tables securely
    await truncateTables(db);

    // Domains
    await seeds.seedIdentity(db);
    await seeds.seedCatalog(db);
    await seeds.seedSchoolEngine(db);
    await seeds.seedSales(db);
    await seeds.seedInventory(db);
    await seeds.seedSystem(db);

    const duration = Date.now() - startedAt;
    console.log(`🎉 Seeding completed successfully in ${duration}ms!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    // Ensure postgres connection terminates so the terminal script finishes
    await connection.end();
    process.exit(0);
  }
}

main();
