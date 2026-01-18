/**
 * Category Database Schema
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Categories Table
 *
 * Stores base category information.
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Category Translations Table
 */
export const categoryTranslations = pgTable(
  "category_translations",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    language: text("language").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.categoryId, table.language] }),
  }),
);

/**
 * Define Relations
 */
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  translations: many(categoryTranslations),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, {
    relationName: "category_parent",
  }),
}));

export const categoryTranslationsRelations = relations(
  categoryTranslations,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryTranslations.categoryId],
      references: [categories.id],
    }),
  }),
);

/**
 * Type Exports
 */
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type NewCategoryTranslation = typeof categoryTranslations.$inferInsert;
