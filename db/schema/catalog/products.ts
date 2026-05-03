/**
 * Product Database Schema (SPU Layer)
 *
 * Products are now Standard Product Units (SPUs) — the conceptual item.
 * Purchasable details (price, stock, images) live on product_variants (SKUs).
 */

import { serial, text, integer, jsonb, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { catalogSchema } from "../schemas";
import { categories } from "./categories";
import { brands } from "./brands";
import { productTags } from "./tags";
import { productAttributes } from "./product-attributes";
import { productVariants } from "./product-variants";
import { PartialTranslationMap, ResponsiveMediaSet } from "../../types";

/**
 * Products Table (SPU)
 *
 * Stores the conceptual product — brand, category, localized content, flags.
 * All pricing, inventory, and images are on product_variants.
 */
export const products = catalogSchema.table("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").unique(),
  /** Optional family-level SKU prefix (e.g., "STA-PEN") */
  skuPrefix: text("sku_prefix"),

  // ─── Localized Content ──────────────────────────────────────────────

  slug: text("slug").unique(),
  localizedName: jsonb("localized_name").$type<PartialTranslationMap>().default({}).notNull(),
  localizedDescription: jsonb("localized_description")
    .$type<PartialTranslationMap>()
    .default({})
    .notNull(),
  localizedLongDescription: jsonb("localized_long_description")
    .$type<PartialTranslationMap>()
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

  // ─── Flags ──────────────────────────────────────────────────────────

  /** Whether this product is visible in the store */
  isActive: boolean("is_active").default(true).notNull(),

  // ─── Aggregate Ratings ──────────────────────────────────────────────

  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),

  // ─── Timestamps ─────────────────────────────────────────────────────

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

/**
 * Product Relations
 */
export const productsRelations = relations(products, ({ one, many }) => ({
  variants: many(productVariants),
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

// ─── Type Exports ────────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
