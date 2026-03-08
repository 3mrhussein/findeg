import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  console.log("🚀 Starting manual database schema repair...");
  try {
    // 1. Add missing columns to category_translations
    console.log("Adding name_normalized to category_translations...");
    await sql`ALTER TABLE category_translations ADD COLUMN IF NOT EXISTS name_normalized TEXT`;

    // 2. Add missing columns to product_translations
    console.log("Adding name_normalized and description_normalized to product_translations...");
    await sql`ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS name_normalized TEXT`;
    await sql`ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS description_normalized TEXT`;

    // 3. Backfill data if empty
    console.log("Backfilling normalized data...");
    await sql`UPDATE category_translations SET name_normalized = LOWER(name) WHERE name_normalized IS NULL`;
    await sql`UPDATE product_translations SET name_normalized = LOWER(name) WHERE name_normalized IS NULL`;
    await sql`UPDATE product_translations SET description_normalized = LOWER(description) WHERE description_normalized IS NULL AND description IS NOT NULL`;

    console.log("✅ Database schema repair completed successfully!");
  } catch (error) {
    console.error("❌ Error during schema repair:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
