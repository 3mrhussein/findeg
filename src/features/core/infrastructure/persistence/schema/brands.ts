/**
 * Brands Database Schema
 *
 * Stores product brand information.
 * Each product may optionally belong to a brand.
 */

import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";

/**
 * Brands Table
 *
 * Stores brand metadata:
 * - `slug` — URL-friendly unique identifier (e.g., "staedtler")
 * - `name` — Display name (e.g., "Staedtler")
 * - `logoUrl` — Optional brand logo image URL
 * - `isActive` — Soft-delete / visibility toggle
 */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Brand Relations
 *
 * A brand has many products.
 */
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

/**
 * Type Exports
 */
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
