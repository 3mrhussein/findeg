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

function formatTableList(tableNames) {
  if (tableNames.length === 0) return "none";
  return tableNames.join(", ");
}

function formatClearedRows(rowCounts) {
  return Object.entries(rowCounts)
    .filter(([, count]) => count > 0)
    .map(([tableName, count]) => `${tableName}:${count}`)
    .join(", ");
}

async function main() {
  const sql = createSqlClient();

  try {
    const startedAt = Date.now();
    console.log("🌱 Starting fresh CSV seed...");
    const result = await sql.begin(async (tx) => {
      const truncateSummary = await truncateSeedTables(tx);
      const importSummary = await seedFromCsvSnapshots(tx);
      return { truncateSummary, importSummary };
    });

    const { truncateSummary, importSummary } = result;
    const clearedRowsText = formatClearedRows(truncateSummary.rowCounts);

    console.log(
      `🧹 Truncated ${truncateSummary.truncatedTables.length} table(s), cleared ${truncateSummary.rowsCleared} row(s).`,
    );
    if (clearedRowsText) {
      console.log(`   Cleared rows by table: ${clearedRowsText}`);
    }

    console.log(`📥 Imported ${importSummary.insertedRows} row(s) from CSV snapshots.`);
    for (const tableSummary of importSummary.tableSummaries) {
      console.log(`   ${tableSummary.tableName}: +${tableSummary.insertedRows}`);
    }

    console.log(
      `🔁 Reset ID sequences on ${importSummary.sequenceResetTables.length} table(s): ${formatTableList(importSummary.sequenceResetTables)}`,
    );

    if (importSummary.skippedTables.length > 0) {
      console.log(
        `⚠️ Skipped ${importSummary.skippedTables.length} table(s) not present in DB: ${formatTableList(importSummary.skippedTables)}`,
      );
    }

    const durationMs = Date.now() - startedAt;
    console.log(`✅ Fresh CSV seed completed successfully in ${durationMs}ms.`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
