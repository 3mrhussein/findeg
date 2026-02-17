/**
 * Variant Pricing & Sellable UoM Schema
 *
 * Additive schema for:
 * - sellable units of measure per product variant
 * - customer-group price lists per product variant + UoM
 *
 * Note:
 * Variants are currently modeled as JSON in `products.variants`, so this schema
 * uses `variantKey` (string) to reference a deterministic variant identifier.
 */

import {
  pgTable,
  serial,
  integer,
  text,
  decimal,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";

/**
 * variant_sellable_uoms
 *
 * Defines which UoMs are sellable for a given product variant.
 * Example:
 * - variantKey="blue-0.7" + uomCode="pcs" + factorToBase=1
 * - variantKey="blue-0.7" + uomCode="pack" + factorToBase=12
 */
export const variantSellableUoms = pgTable(
  "variant_sellable_uoms",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** Stable key for the variant inside product.variants JSON */
    variantKey: text("variant_key").notNull(),
    /** Unit code: pcs | pack | carton (extensible) */
    uomCode: text("uom_code").notNull(),
    /** Conversion factor to base unit (e.g., pack=12 pcs) */
    factorToBase: decimal("factor_to_base", { precision: 12, scale: 4 }).notNull(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqVariantUom: uniqueIndex("uq_variant_sellable_uoms_variant_uom").on(
      table.productId,
      table.variantKey,
      table.uomCode,
    ),
    idxProduct: index("idx_variant_sellable_uoms_product_id").on(table.productId),
  }),
);

/**
 * variant_price_lists
 *
 * Stores effective unit prices by customer group for each variant/UoM.
 * Example:
 * - public_b2c + pcs = 15 EGP
 * - school_b2b + pack = 160 EGP
 */
export const variantPriceLists = pgTable(
  "variant_price_lists",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantKey: text("variant_key").notNull(),
    customerGroup: text("customer_group").notNull(),
    uomCode: text("uom_code").notNull(),
    currency: text("currency").notNull().default("EGP"),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    isSellable: boolean("is_sellable").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqVariantPriceList: uniqueIndex("uq_variant_price_lists_variant_group_uom").on(
      table.productId,
      table.variantKey,
      table.customerGroup,
      table.uomCode,
    ),
    idxProduct: index("idx_variant_price_lists_product_id").on(table.productId),
    idxCustomerGroup: index("idx_variant_price_lists_customer_group").on(table.customerGroup),
  }),
);

export const variantSellableUomsRelations = relations(variantSellableUoms, ({ one }) => ({
  product: one(products, {
    fields: [variantSellableUoms.productId],
    references: [products.id],
  }),
}));

export const variantPriceListsRelations = relations(variantPriceLists, ({ one }) => ({
  product: one(products, {
    fields: [variantPriceLists.productId],
    references: [products.id],
  }),
}));

export type VariantSellableUom = typeof variantSellableUoms.$inferSelect;
export type NewVariantSellableUom = typeof variantSellableUoms.$inferInsert;
export type VariantPriceList = typeof variantPriceLists.$inferSelect;
export type NewVariantPriceList = typeof variantPriceLists.$inferInsert;
