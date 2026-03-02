/**
 * Variant Pricing & Sellable UoM Schema
 *
 * Pricing and UOM definitions that attach directly to product_variants (SKU level).
 *
 * Tables:
 * - variant_sellable_uoms: Which UOMs a variant can be sold in (EA, PACK_3, BOX_12)
 * - variant_price_lists: Customer-group prices per variant per UOM
 *
 * Changes from v1:
 * - Replaced (product_id, variant_key) with variant_id FK to product_variants
 * - Added localized_label and barcode to UOMs
 * - Added min_qty, starts_at, ends_at to price lists for future tiered/time-bounded pricing
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
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productVariants } from "./product-variants";
import type { CurrencyCode, CustomerGroup, UomCode } from "@/features/core/domain/types/common";
import type { LocalizedStringDraft } from "@/features/core/domain/value-objects";

/**
 * variant_sellable_uoms
 *
 * Defines which UoMs are sellable for a given variant.
 * Example:
 * - variantId=10 + uomCode="EA"   + factorToBase=1
 * - variantId=10 + uomCode="PACK" + factorToBase=12
 */
export const variantSellableUoms = pgTable(
  "variant_sellable_uoms",
  {
    id: serial("id").primaryKey(),

    /** FK to the specific variant (SKU) */
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    /** Unit code: EA, PACK_3, BOX_12, etc. */
    uomCode: text("uom_code").$type<UomCode>().notNull(),

    /** Conversion factor to base unit (EA). E.g., PACK_3 = 3 */
    factorToBase: decimal("factor_to_base", { precision: 12, scale: 4 }).notNull(),

    /** Localized display label (e.g., { en: "Pack of 3", ar: "علبة ٣" }) */
    localizedLabel: jsonb("localized_label").$type<LocalizedStringDraft>().default({}),

    /** UOM-specific barcode (if different from variant barcode) */
    barcode: text("barcode"),

    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqVariantUom: uniqueIndex("uq_variant_sellable_uoms_variant_uom").on(
      table.variantId,
      table.uomCode,
    ),
    idxVariant: index("idx_variant_sellable_uoms_variant").on(table.variantId),
  }),
);

/**
 * variant_price_lists
 *
 * Stores effective unit prices by customer group for each variant/UoM.
 * Example:
 * - variantId=10 + public_b2c + EA = 15 EGP
 * - variantId=10 + wholesale  + PACK = 160 EGP
 */
export const variantPriceLists = pgTable(
  "variant_price_lists",
  {
    id: serial("id").primaryKey(),

    /** FK to the specific variant (SKU) */
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    /** Which pricing group: public_b2c, school_b2b, wholesale */
    customerGroup: text("customer_group").$type<CustomerGroup>().notNull(),

    /** Which unit of measure this price applies to */
    uomCode: text("uom_code").$type<UomCode>().notNull(),

    /** Default currency */
    currency: text("currency").$type<CurrencyCode>().notNull().default("EGP"),

    /** Price per single UOM unit */
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),

    /** v2: Minimum quantity for tiered pricing breakpoint */
    minQty: integer("min_qty").default(1).notNull(),

    /** Whether this variant/UOM combo can be purchased via this group */
    isSellable: boolean("is_sellable").notNull().default(true),

    /** v2: Time-bounded pricing — when this price row becomes active */
    startsAt: timestamp("starts_at"),

    /** v2: Time-bounded pricing — when this price row expires */
    endsAt: timestamp("ends_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqVariantPriceList: uniqueIndex("uq_variant_price_lists_variant_group_uom").on(
      table.variantId,
      table.customerGroup,
      table.uomCode,
      table.minQty,
    ),
    idxVariant: index("idx_variant_price_lists_variant").on(table.variantId),
    idxCustomerGroup: index("idx_variant_price_lists_customer_group").on(table.customerGroup),
  }),
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const variantSellableUomsRelations = relations(variantSellableUoms, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantSellableUoms.variantId],
    references: [productVariants.id],
  }),
}));

export const variantPriceListsRelations = relations(variantPriceLists, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantPriceLists.variantId],
    references: [productVariants.id],
  }),
}));

// ─── Type Exports ────────────────────────────────────────────────────────────

export type VariantSellableUom = typeof variantSellableUoms.$inferSelect;
export type NewVariantSellableUom = typeof variantSellableUoms.$inferInsert;
export type VariantPriceList = typeof variantPriceLists.$inferSelect;
export type NewVariantPriceList = typeof variantPriceLists.$inferInsert;
