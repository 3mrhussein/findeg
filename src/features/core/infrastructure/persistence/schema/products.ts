/**
 * Product Database Schema (SPU Layer)
 *
 * Products are now Standard Product Units (SPUs) — the conceptual item.
 * Purchasable details (price, stock, images) live on product_variants (SKUs).
 *
 * Schema Structure:
 * - products: Base SPU table (category, brand, localized content, flags)
 * - productTranslations: Legacy translation rows (JSONB is source of truth)
 *
 * Removed from this table (moved to product_variants):
 * - sku → product_variants.sku
 * - price / strikePrice → product_variants.base_price / strike_price
 * - pricing (JSONB) → variant_price_lists table
 * - discountRules (JSONB) → discount_rules table
 * - images (JSONB) → variant_images table
 * - stockQuantity / lowStockThreshold → inventory_balances + product_variants
 * - variants (JSONB) → product_variants table
 */

import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  boolean,
  timestamp,
  primaryKey,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { brands } from "./brands";
import { productTags } from "./tags";
import { productAttributes } from "./product-attributes";
import { productVariants } from "./product-variants";
import type {
  Locale,
  LocalizedStringDraft,
  ResponsiveMediaSet,
} from "@/features/core/domain/value-objects";

/**
 * Products Table (SPU)
 *
 * Stores the conceptual product — brand, category, localized content, flags.
 * All pricing, inventory, and images are on product_variants.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  /** Optional family-level SKU prefix (e.g., "STA-PEN") */
  skuPrefix: text("sku_prefix"),

  // ─── Localized Content ──────────────────────────────────────────────

  localizedSlug: jsonb("localized_slug").$type<LocalizedStringDraft>().default({}).notNull(),
  localizedName: jsonb("localized_name").$type<LocalizedStringDraft>().default({}).notNull(),
  localizedDescription: jsonb("localized_description")
    .$type<LocalizedStringDraft>()
    .default({})
    .notNull(),
  localizedLongDescription: jsonb("localized_long_description")
    .$type<LocalizedStringDraft>()
    .default({})
    .notNull(),

  // ─── Relationships ──────────────────────────────────────────────────

  /** FK to categories — primary navigation category */
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  /** FK to brands */
  brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),

  // ─── Media ──────────────────────────────────────────────────────────

  /** SPU-level hero/lifestyle imagery */
  mediaSet: jsonb("media_set").$type<ResponsiveMediaSet>().default({}),

  /** Lightweight JSONB for unstructured display metadata (non-filterable) */
  displayMeta: jsonb("display_meta").$type<Record<string, unknown>>().default({}).notNull(),

  // ─── Flags ──────────────────────────────────────────────────────────

  /** Whether this product is visible in the store */
  isActive: boolean("is_active").default(true).notNull(),

  /** Whether this product is marked as new */
  isNew: boolean("is_new").default(false),

  // ─── Aggregate Ratings ──────────────────────────────────────────────

  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),

  // ─── Timestamps ─────────────────────────────────────────────────────

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Product Translations Table
 *
 * Legacy translation rows. The JSONB localizedName/localizedDescription
 * columns are the source of truth, but this table is kept for
 * query-friendly lookups and backward compatibility.
 */
export const productTranslations = pgTable(
  "product_translations",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    language: text("language").$type<Locale>().notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.language] }),
  }),
);

// ─── Relations ───────────────────────────────────────────────────────────────

/**
 * Product Relations
 *
 * - variants: One product (SPU) has many variants (SKUs)
 * - translations: Legacy translation rows
 * - category: Primary navigation category
 * - brand: Product brand
 * - tags: Many-to-many product tags
 * - attributes: SPU-level attributes (spec sheet)
 */
export const productsRelations = relations(products, ({ one, many }) => ({
  variants: many(productVariants),
  translations: many(productTranslations),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  tags: many(productTags),
  attributes: many(productAttributes),
}));

/** Each translation belongs to one product */
export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, {
    fields: [productTranslations.productId],
    references: [products.id],
  }),
}));

// ─── Type Exports ────────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductTranslation = typeof productTranslations.$inferSelect;
export type NewProductTranslation = typeof productTranslations.$inferInsert;
