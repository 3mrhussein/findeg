/**
 * School Lists Database Schema
 *
 * Core engine for school-provided stationery lists.
 */

import {
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { schoolEngineSchema } from "../schemas";
import { categories } from "../catalog/categories";
import { productVariants } from "../catalog/product-variants";
import type { PartialTranslationMap } from "../../../backend/src/features/core/domain/value-objects";

export type MatchRulesDraft = {
  attributes?: Record<string, string | number | boolean>;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
};

/**
 * school_lists Table
 */
export const schoolLists = schoolEngineSchema.table(
  "school_lists",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    schoolName: text("school_name").notNull(),
    grade: text("grade").notNull(),
    academicYear: text("academic_year").notNull(),

    /** Filter columns */
    governorate: text("governorate"),
    area: text("area"),
    schoolType: text("school_type"),
    academicSystem: text("academic_system"),

    /** Localized content */
    localizedTitle: jsonb("localized_title").$type<PartialTranslationMap>().notNull(),
    localizedDescription: jsonb("localized_description").$type<PartialTranslationMap>(),

    /** Optional metadata */
    heroImageUrl: text("hero_image_url"),
    logoUrl: text("logo_url"),

    isActive: boolean("is_active").default(true).notNull(),
    accessMode: text("access_mode").default("public").notNull(),
    accessCode: text("access_code"),
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    // Deprecated/Legacy compatibility field
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  },
  (table) => [
    index("idx_school_lists_code").on(table.accessCode),
    uniqueIndex("uq_school_year_grade").on(table.slug, table.academicYear, table.grade),
  ],
);

/**
 * school_list_items Table
 */
export const schoolListItems = schoolEngineSchema.table("school_list_items", {
  id: serial("id").primaryKey(),
  schoolListId: integer("school_list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),

  /** Reference variant (SKU) */
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),

  /** Recommended quantity */
  quantity: integer("quantity").notNull().default(1),
  quantityRequired: integer("quantity_required").notNull().default(1),

  /** Whether this item is mandatory */
  isOptional: boolean("is_optional").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),

  /** Localized display labels and notes */
  localizedLabel: jsonb("localized_label").$type<Record<string, string>>().notNull(),
  localizedNote: jsonb("localized_note").$type<PartialTranslationMap>(),

  /** Match rules for dynamic variants */
  matchRules: jsonb("match_rules").$type<MatchRulesDraft>(),

  sortOrder: integer("sort_order").default(0).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),

  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * school_list_item_alternatives Table
 */
export const schoolListItemAlternatives = schoolEngineSchema.table(
  "school_list_item_alternatives",
  {
    id: serial("id").primaryKey(),
    listItemId: integer("list_item_id")
      .notNull()
      .references(() => schoolListItems.id, { onDelete: "cascade" }),

    /** Alternative variant (SKU) */
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    /** Recommendation rank (Lower = better alternative) */
    priority: integer("priority").default(0).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
  },
);

/**
 * Relations
 */
export const schoolListsRelations = relations(schoolLists, ({ one, many }) => ({
  category: one(categories, {
    fields: [schoolLists.categoryId],
    references: [categories.id],
  }),
  items: many(schoolListItems),
}));

export const schoolListItemsRelations = relations(schoolListItems, ({ one, many }) => ({
  schoolList: one(schoolLists, {
    fields: [schoolListItems.schoolListId],
    references: [schoolLists.id],
  }),
  variant: one(productVariants, {
    fields: [schoolListItems.variantId],
    references: [productVariants.id],
  }),
  alternatives: many(schoolListItemAlternatives),
}));

export const schoolListItemAlternativesRelations = relations(
  schoolListItemAlternatives,
  ({ one }) => ({
    listItem: one(schoolListItems, {
      fields: [schoolListItemAlternatives.listItemId],
      references: [schoolListItems.id],
    }),
    variant: one(productVariants, {
      fields: [schoolListItemAlternatives.variantId],
      references: [productVariants.id],
    }),
  }),
);

export type SchoolList = typeof schoolLists.$inferSelect;
export type NewSchoolList = typeof schoolLists.$inferInsert;
export type SchoolListItem = typeof schoolListItems.$inferSelect;
export type NewSchoolListItem = typeof schoolListItems.$inferInsert;
