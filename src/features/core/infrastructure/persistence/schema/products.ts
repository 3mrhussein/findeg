/**
 * Product Database Schema
 *
 * This file defines the database schema for products using Drizzle ORM.
 *
 * Schema Structure:
 * - products: Base product table (language-independent fields)
 * - productTranslations: Language-specific product information
 * - productImages: Product images (separate table for normalization)
 *
 * Translation Strategy:
 * - Base product data (price, category, stock, etc.) in products table
 * - Translated content (name, description) in productTranslations table
 * - Supports multiple languages (en, ar, etc.)
 */

import {
  pgTable,
  serial,
  text,
  decimal,
  integer,
  jsonb,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { brands } from "./brands";
import type { Locale } from "@/features/core/domain/value-objects";

/**
 * Products Table
 *
 * Stores base product information that is language-independent:
 * - Pricing (price, strikePrice)
 * - Inventory (sku, stockQuantity, lowStockThreshold)
 * - Relationships (categoryId FK, brandId FK)
 * - Flags (isNew, isActive)
 * - Ratings (rating, reviewsCount)
 * - Variants (JSON for flexibility)
 *
 * Language-specific content (name, description) is in productTranslations.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  /** Unique stock-keeping unit identifier */
  sku: text("sku").unique(),

  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  strikePrice: decimal("strike_price", { precision: 10, scale: 2 }),

  // Foreign keys
  /** FK to categories table — replaces old text-based category */
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  /** FK to brands table */
  brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),

  // Images (array of URLs stored as JSON)
  images: jsonb("images").$type<string[]>().default([]),

  // Inventory
  /** Whether this product is visible in the store */
  isActive: boolean("is_active").default(true).notNull(),
  /** Current stock quantity */
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  /** Alert threshold — triggers low-stock warnings when stock falls below */
  lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),

  // Flags
  isNew: boolean("is_new").default(false),

  // Ratings
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),

  // Variants (stored as JSON for flexibility)
  // Format: { "Color": { name: "Color", options: [...] }, ... }
  variants: jsonb("variants").$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Product Translations Table
 *
 * Stores language-specific product information:
 * - Name, description, long description
 * - One row per product per language
 *
 * This allows us to have:
 * - Product 1 in English: "Premium Pen"
 * - Product 1 in Arabic: "قلم ممتاز"
 */
export const productTranslations = pgTable(
  "product_translations",
  {
    /** Foreign key to products table */
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    /** Language code (e.g., 'en', 'ar') */
    language: text("language").$type<Locale>().notNull(),

    // Translated content
    name: text("name").notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    /** Composite primary key: one translation per product per language */
    pk: primaryKey({ columns: [table.productId, table.language] }),
  }),
);

/**
 * Product Images Table
 *
 * Normalized image storage with ordering and alt text.
 * Allows for richer image management than the JSON array approach.
 */
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  /** Display order — lower numbers appear first */
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Product Relations
 *
 * - translations: One product has many translations (one per language)
 * - images: One product has many images (normalized table)
 * - category: Each product belongs to one category (optional)
 * - brand: Each product belongs to one brand (optional)
 */
export const productsRelations = relations(products, ({ one, many }) => ({
  translations: many(productTranslations),
  images: many(productImages),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
}));

/** Each translation belongs to one product */
export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, {
    fields: [productTranslations.productId],
    references: [products.id],
  }),
}));

/** Each image belongs to one product */
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

/**
 * Type Exports
 *
 * Export types for use in repositories and services.
 */
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductTranslation = typeof productTranslations.$inferSelect;
export type NewProductTranslation = typeof productTranslations.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
