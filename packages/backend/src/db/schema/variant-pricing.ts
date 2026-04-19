import {
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
import { catalogSchema } from "./schemas";
import type { CurrencyCode, CustomerGroup, UomCode } from "@/features/core/domain/types/common";
import type { LocalizedStringDraft } from "@/features/core/domain/value-objects";

/**
 * Variant Sellable Units of Measure (UOM)
 */
export const variantSellableUoms = catalogSchema.table(
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

    /** Localized display label */
    localizedLabel: jsonb("localized_label").$type<LocalizedStringDraft>().default({}),

    /** UOM-specific barcode */
    barcode: text("barcode"),

    isEnabled: boolean("is_enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_variant_sellable_uoms_variant_uom").on(table.variantId, table.uomCode),
    index("idx_variant_sellable_uoms_variant").on(table.variantId),
  ],
);

/**
 * Variant Price Lists
 */
export const variantPriceLists = catalogSchema.table(
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

    /** Minimum quantity for tiered pricing breakpoint */
    minQty: integer("min_qty").default(1).notNull(),

    /** Whether this variant/UOM combo can be purchased via this group */
    isSellable: boolean("is_sellable").notNull().default(true),

    /** Time-bounded pricing start */
    startsAt: timestamp("starts_at"),

    /** Time-bounded pricing end */
    endsAt: timestamp("ends_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_variant_price_lists_variant_group_uom").on(
      table.variantId,
      table.customerGroup,
      table.uomCode,
      table.minQty,
    ),
    index("idx_variant_price_lists_variant").on(table.variantId),
    index("idx_variant_price_lists_customer_group").on(table.customerGroup),
  ],
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
