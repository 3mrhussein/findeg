/**
 * Database Fresh Seed Script (CSV Snapshot Mode)
 *
 * 1) Clears seeded tables
 * 2) Imports CSV snapshots
 *
 * Usage:
 *   npm run db:seed
 */

import * as dotenv from "dotenv";
import { createSqlClient, seedFromCsvSnapshots, truncateSeedTables } from "./lib/csv-seed.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const sql = createSqlClient();

  try {
    console.log("🌱 Starting fresh CSV seed...");
    await sql.begin(async (tx) => {
      await truncateSeedTables(tx);
      await seedFromCsvSnapshots(tx);
    });
    console.log("✨ Fresh CSV seed completed successfully.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
