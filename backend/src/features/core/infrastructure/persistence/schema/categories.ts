/**
 * Categories Database Schema
 *
 * This file defines the database schema for categories using Drizzle ORM.
 * Follows the normalized translation pattern with materialized path for hierarchy.
 */

import { serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { catalogSchema } from "./schemas";
import { products } from "./products";
import type { LocalizedStringDraft } from "@findeg/backend/features/core/domain/value-objects";

/**
 * Categories Table
 */
export const categories = catalogSchema.table("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  /** Locale-keyed name map */
  localizedName: jsonb("localized_name").$type<LocalizedStringDraft>().default({}).notNull(),
  /** Locale-keyed description map */
  localizedDescription: jsonb("localized_description")
    .$type<LocalizedStringDraft>()
    .default({})
    .notNull(),
  parentId: integer("parent_id"),
  icon: text("icon"),

  /** Materialized path (e.g., "/1/3/7") for efficient tree queries */
  path: text("path").default("/").notNull(),
  /** Nesting depth: 0 = root category */
  depth: integer("depth").default(0).notNull(),
  /** Display order among sibling categories (lower = first) */
  sortOrder: integer("sort_order").default(0).notNull(),
  /** Whether this category is visible in the store */
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Category Relations
 */
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_hierarchy",
  }),
  children: many(categories, {
    relationName: "category_hierarchy",
  }),
  products: many(products),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
