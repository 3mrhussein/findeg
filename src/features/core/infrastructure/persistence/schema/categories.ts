/**
 * Categories Database Schema
 *
 * This file defines the database schema for categories using Drizzle ORM.
 * Follows the normalized translation pattern with materialized path for hierarchy.
 *
 * Materialized Path Strategy:
 * - `path` stores the full ancestor chain (e.g., "/1/3/7")
 * - `depth` indicates nesting level (0 = root, 1 = child, etc.)
 * - Enables efficient tree queries and descendant lookups
 */

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import type { Locale, LocalizedStringDraft } from "@/features/core/domain/value-objects";

/**
 * Categories Table
 *
 * Stores base category information with materialized path hierarchy:
 * - `slug` — URL-friendly unique identifier
 * - `parentId` — Self-referencing FK for tree structure
 * - `path` — Materialized path for efficient ancestor/descendant queries
 * - `depth` — Nesting level (0 = root)
 * - `sortOrder` — Display ordering within siblings
 * - `isActive` — Visibility toggle
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  /** Locale-keyed slug map (target model) */
  localizedSlug: jsonb("localized_slug").$type<LocalizedStringDraft>().default({}).notNull(),
  /** Locale-keyed name map (target model) */
  localizedName: jsonb("localized_name").$type<LocalizedStringDraft>().default({}).notNull(),
  /** Locale-keyed description map (target model) */
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
 * Category Translations Table
 *
 * Stores language-specific category names and descriptions.
 */
export const categoryTranslations = pgTable(
  "category_translations",
  {
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    language: text("language").$type<Locale>().notNull(),
    name: text("name").notNull(),
    nameNormalized: text("name_normalized"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.categoryId, table.language] }),
  }),
);

/**
 * Category Relations
 *
 * - parent/children: Self-referencing hierarchy
 * - translations: Language-specific content
 * - products: One-to-many via products.categoryId FK
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
  translations: many(categoryTranslations),
  products: many(products),
}));

/** Each translation belongs to one category */
export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, {
    fields: [categoryTranslations.categoryId],
    references: [categories.id],
  }),
}));

/**
 * Type Exports
 */
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type NewCategoryTranslation = typeof categoryTranslations.$inferInsert;
