import { db } from "@/features/core/infrastructure/persistence";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 *
 */
export async function GET() {
  console.log("🚀 Starting DB fix via API...");
  try {
    // 1. Add missing columns to category_translations
    console.log("Adding columns to category_translations...");
    await db.execute(
      sql`ALTER TABLE category_translations ADD COLUMN IF NOT EXISTS name_normalized TEXT`,
    );

    // 2. Add missing columns to product_translations
    console.log("Adding columns to product_translations...");
    await db.execute(
      sql`ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS name_normalized TEXT`,
    );
    await db.execute(
      sql`ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS description_normalized TEXT`,
    );

    // 3. Backfill data
    console.log("Backfilling data...");
    await db.execute(
      sql`UPDATE category_translations SET name_normalized = LOWER(name) WHERE name_normalized IS NULL`,
    );
    await db.execute(
      sql`UPDATE product_translations SET name_normalized = LOWER(name) WHERE name_normalized IS NULL`,
    );
    await db.execute(
      sql`UPDATE product_translations SET description_normalized = LOWER(description) WHERE description_normalized IS NULL AND description IS NOT NULL`,
    );

    return NextResponse.json({ success: true, message: "Database columns added and backfilled" });
  } catch (error: any) {
    console.error("❌ Error fixing DB:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
