/**
 * Product Variants Database Schema
 *
 * Normalized variant (SKU) tables:
 * - product_variants: Each row = one purchasable SKU
 * - variant_images: SKU-level image gallery
 * - variant_attributes: SKU-level filterable specs (color, tip_size, etc.)
 *
 * Design:
 * - Products are SPUs (conceptual); variants are SKUs (purchasable).
 * - Simple products get one "default" variant row.
 * - Pricing, inventory, and images all attach at the variant level.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import { catalogSchema } from "./schemas";
import { attributeDefinitions } from "./product-attributes";
import { variantSellableUoms, variantPriceLists } from "./variant-pricing";
import type { LocalizedStringDraft } from "@features/core/domain/value-objects";
import type { ResponsiveMediaSet } from "@features/core/domain/value-objects";

// ─── Product Variants (SKU rows) ────────────────────────────────────────────

/**
 * Product Variants Table (SKU)
 *
 * Stores the actual purchasable unit with its unique SKU, pricing, and key features.
 */
export const productVariants = catalogSchema.table(
  "product_variants",
  {
    id: serial("id").primaryKey(),

    /** Parent SPU */
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    /** Unique SKU code for this variant */
    sku: text("sku").notNull().unique(),

    /** Deterministic key within the product (e.g., "blue-0.7") */
    variantKey: text("variant_key").notNull(),

    /** Localized display label (e.g., { en: "Blue 0.7mm", ar: "أزرق ٠.٧مم" }) */
    localizedLabel: jsonb("localized_label").$type<LocalizedStringDraft>().default({}).notNull(),

    /** Sort order within the parent product */
    displayOrder: integer("display_order").default(0).notNull(),

    /** Whether this variant is visible and purchasable */
    isActive: boolean("is_active").default(true).notNull(),

    // ─── Pricing (B2C sticker price at EA level) ────────────────────────

    /** Base B2C price per EA (sticker price) */
    basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),

    /** Strike-through / was-price for display */
    strikePrice: decimal("strike_price", { precision: 12, scale: 2 }),

    /** Internal cost price (not shown to customer) */
    costPrice: decimal("cost_price", { precision: 12, scale: 2 }),

    // ─── Physical ───────────────────────────────────────────────────────

    /** Weight in grams (for shipping calc) */
    weightGrams: integer("weight_grams"),

    /** EAN/UPC barcode */
    barcode: text("barcode"),

    /** Alert threshold for low-stock warnings */
    lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),

    // ─── Timestamps ─────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    /** Each variant_key is unique within a product */
    uqProductVariantKey: uniqueIndex("uq_variant_product_key").on(
      table.productId,
      table.variantKey,
    ),
    /** Fast lookup for "all variants of a product" */
    idxVariantProduct: index("idx_variant_product").on(table.productId),
    /** SKU lookup */
    idxVariantSku: index("idx_variant_sku").on(table.sku),
  }),
);

// ─── Variant Images ──────────────────────────────────────────────────────────

/**
 * Variant Images Table
 */
export const variantImages = catalogSchema.table(
  "variant_images",
  {
    id: serial("id").primaryKey(),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    idxVariantImagesVariant: index("idx_variant_images_variant").on(table.variantId),
  }),
);

// ─── Variant Attributes ──────────────────────────────────────────────────────

/**
 * variant_attributes
 *
 * SKU-level typed attribute values for filtering and school-list matching.
 * E.g., variantId=10 + attribute "ink_color" → value_text = "blue"
 */
export const variantAttributes = catalogSchema.table(
  "variant_attributes",
  {
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    attributeId: integer("attribute_id")
      .notNull()
      .references(() => attributeDefinitions.id, { onDelete: "cascade" }),

    /** String / enum value */
    valueText: text("value_text"),

    /** Numeric value */
    valueNum: decimal("value_num", { precision: 12, scale: 4 }),

    /** Boolean value */
    valueBool: boolean("value_bool"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.variantId, table.attributeId] }),
    idxVariantAttrVariant: index("idx_variant_attr_variant").on(table.variantId),
    idxVariantAttrText: index("idx_variant_attr_text").on(table.attributeId, table.valueText),
    idxVariantAttrNum: index("idx_variant_attr_num").on(table.attributeId, table.valueNum),
  }),
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  images: many(variantImages),
  attributes: many(variantAttributes),
  sellableUoms: many(variantSellableUoms),
  priceLists: many(variantPriceLists),
}));

export const variantImagesRelations = relations(variantImages, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantImages.variantId],
    references: [productVariants.id],
  }),
}));

export const variantAttributesRelations = relations(variantAttributes, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantAttributes.variantId],
    references: [productVariants.id],
  }),
  definition: one(attributeDefinitions, {
    fields: [variantAttributes.attributeId],
    references: [attributeDefinitions.id],
  }),
}));

// ─── Type Exports ────────────────────────────────────────────────────────────

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type VariantImage = typeof variantImages.$inferSelect;
export type NewVariantImage = typeof variantImages.$inferInsert;
export type VariantAttribute = typeof variantAttributes.$inferSelect;
export type NewVariantAttribute = typeof variantAttributes.$inferInsert;
