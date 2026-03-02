/**
 * Inventory Database Schema
 *
 * Normalized inventory tracking:
 * - warehouses: Physical stock locations
 * - inventory_balances: Materialized balance per variant per warehouse
 * - stock_movements: Immutable audit ledger of all stock changes
 *
 * Design:
 * - Inventory attaches at the variant (SKU) level, not the product (SPU) level.
 * - Even with one warehouse initially, the model scales without schema changes.
 * - `available = on_hand - reserved` is computed, not stored.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productVariants } from "./product-variants";
import { users } from "./users";

// ─── Warehouses ──────────────────────────────────────────────────────────────

/**
 * warehouses
 *
 * Physical stock locations. Start with one (e.g., "MAIN"),
 * scale to multiple when needed.
 */
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),

  /** Unique business code (e.g., "MAIN", "CAIRO-WH1") */
  code: text("code").notNull().unique(),

  /** Human-readable name */
  name: text("name").notNull(),

  /** Whether this warehouse is operational */
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Inventory Balances ──────────────────────────────────────────────────────

/**
 * inventory_balances
 *
 * Materialized balance for each variant at each warehouse.
 * `available = on_hand - reserved` is computed at query time.
 */
export const inventoryBalances = pgTable(
  "inventory_balances",
  {
    id: serial("id").primaryKey(),

    /** Which SKU */
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    /** Which warehouse */
    warehouseId: integer("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),

    /** Physical stock count */
    onHand: integer("on_hand").default(0).notNull(),

    /** Stock committed to pending orders */
    reserved: integer("reserved").default(0).notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    /** One balance row per variant per warehouse */
    uqInventory: uniqueIndex("uq_inventory_balance").on(table.variantId, table.warehouseId),
    idxInventoryVariant: index("idx_inventory_variant").on(table.variantId),
  }),
);

// ─── Stock Movements ─────────────────────────────────────────────────────────

/**
 * stock_movements
 *
 * Immutable ledger for all inventory changes.
 * Every balance change should produce a movement row for audit.
 *
 * movement_type values:
 *   'receipt'    — goods received
 *   'sale'       — sold and shipped
 *   'adjustment' — manual correction
 *   'return'     — customer return
 *   'reserve'    — committed to an order
 *   'unreserve'  — order cancelled / expired
 */
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: serial("id").primaryKey(),

    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    warehouseId: integer("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),

    /** Type of movement */
    movementType: text("movement_type").notNull(),

    /** Positive for inbound, negative for outbound */
    quantity: integer("quantity").notNull(),

    /** What triggered this movement (e.g., 'order', 'manual', 'import') */
    referenceType: text("reference_type"),

    /** ID of the triggering entity (order ID, import batch ID, etc.) */
    referenceId: text("reference_id"),

    /** Optional admin notes */
    notes: text("notes"),

    /** Who performed the action */
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    idxStockMovementsVariant: index("idx_stock_movements_variant").on(table.variantId),
    idxStockMovementsCreated: index("idx_stock_movements_created").on(table.createdAt),
  }),
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  inventoryBalances: many(inventoryBalances),
  stockMovements: many(stockMovements),
}));

export const inventoryBalancesRelations = relations(inventoryBalances, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventoryBalances.variantId],
    references: [productVariants.id],
  }),
  warehouse: one(warehouses, {
    fields: [inventoryBalances.warehouseId],
    references: [warehouses.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  variant: one(productVariants, {
    fields: [stockMovements.variantId],
    references: [productVariants.id],
  }),
  warehouse: one(warehouses, {
    fields: [stockMovements.warehouseId],
    references: [warehouses.id],
  }),
  createdByUser: one(users, {
    fields: [stockMovements.createdBy],
    references: [users.id],
  }),
}));

// ─── Type Exports ────────────────────────────────────────────────────────────

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
export type InventoryBalance = typeof inventoryBalances.$inferSelect;
export type NewInventoryBalance = typeof inventoryBalances.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
