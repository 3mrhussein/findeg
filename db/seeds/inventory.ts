import * as schema from "../schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { prepareSeedData, ensureParents } from "./helpers";

import warehousesData from "./data/warehouses.json";
import inventoryBalancesData from "./data/inventory_balances.json";
import stockMovementsData from "./data/stock_movements.json";

export async function seedInventory(db: PostgresJsDatabase<typeof schema>) {
  console.log("🌱 Seeding Inventory Domain...");

  // Level 1: Warehouses (Independent)
  if (warehousesData.length > 0) {
    console.log("  - Seeding Warehouses...");
    await db.insert(schema.warehouses).values(prepareSeedData(schema.warehouses, warehousesData));
  }

  // Level 2: Inventory Balances (Depends on Catalog Product Variants and Inventory Warehouses)
  if (inventoryBalancesData.length > 0) {
    console.log("  - Seeding Inventory Balances...");
    await ensureParents(db, [
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
      { table: schema.warehouses, name: '"inventory"."warehouses"' },
    ]);
    await db
      .insert(schema.inventoryBalances)
      .values(prepareSeedData(schema.inventoryBalances, inventoryBalancesData));
  }

  // Level 3: Stock Movements (Depends on Catalog Product Variants and Inventory Warehouses)
  if (stockMovementsData.length > 0) {
    console.log("  - Seeding Stock Movements...");
    await ensureParents(db, [
      { table: schema.productVariants, name: '"catalog"."product_variants"' },
      { table: schema.warehouses, name: '"inventory"."warehouses"' },
    ]);
    await db
      .insert(schema.stockMovements)
      .values(prepareSeedData(schema.stockMovements, stockMovementsData));
  }
}
