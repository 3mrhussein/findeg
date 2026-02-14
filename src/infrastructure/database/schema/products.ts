/**
 * Product Database Schema
 *
 * This file defines the database schema for products using Drizzle ORM.
 *
 * Schema Structure:
 * - products: Base product table (language-independent fields)
 * - productTranslations: Language-specific product information
 * - productImages: Product images (separate table for normalization)
 * - productVariants: Product variants (if using normalized approach)
 *
 * Translation Strategy:
 * - Base product data (price, category, etc.) in products table
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

/**
 * Products Table
 *
 * Stores base product information that is language-independent:
 * - Price, category, images, variants
 * - Rating, review count
 * - Flags (isNew, etc.)
 *
 * Language-specific content (name, description) is in productTranslations.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  strikePrice: decimal("strike_price", { precision: 10, scale: 2 }),

  // Category (could be normalized, but keeping simple for now)
  category: text("category").notNull(),

  // Images (array of URLs stored as JSON)
  images: jsonb("images").$type<string[]>().default([]),

  // Flags
  isNew: boolean("is_new").default(false),

  // Ratings
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),

  // Variants (stored as JSON for flexibility)
  // Format: { "Color": { name: "Color", options: [...] }, ... }
  variants: jsonb("variants").$type<Record<string, any>>(),

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
    // Foreign key to products table
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    // Language code (e.g., 'en', 'ar')
    language: text("language").notNull(),

    // Translated content
    name: text("name").notNull(),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Composite primary key: one translation per product per language
    pk: primaryKey({ columns: [table.productId, table.language] }),
  }),
);

/**
 * Product Images Table (Optional - if you want normalized images)
 *
 * If you prefer normalized approach instead of JSON array:
 * - Store images in separate table
 * - Allows for additional image metadata
 * - Better for complex image management
 */
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  order: integer("order").default(0), // For ordering images
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Define Relations for Drizzle
 *
 * These relations help with type-safe queries and joins.
 */
export const productsRelations = relations(products, ({ many }) => ({
  // One product has many translations
  translations: many(productTranslations),

  // One product has many images (if using normalized approach)
  images: many(productImages),
}));

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  // Each translation belongs to one product
  product: one(products, {
    fields: [productTranslations.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  // Each image belongs to one product
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
