/**
 * School Lists Database Schema
 *
 * Powers the "Listo for Schools" engine where parents open a deep link
 * to a class-specific supply list and purchase required items.
 *
 * Tables:
 * - school_lists: Top-level list (school + grade + year)
 * - school_list_items: Individual required items with match rules
 * - school_list_item_alternatives: Pre-curated variant (SKU) options per item
 */

import {
  pgTable,
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
import { categories } from "./categories";
import { productVariants } from "./product-variants";
import type { LocalizedStringDraft } from "@/features/core/domain/value-objects";

// ─── Match Rules Type ────────────────────────────────────────────────────────

/**
 * Structured filter for auto-matching variants to a school list requirement.
 *
 * Example:
 * {
 *   attributes: { ink_color: { op: "eq", value: "blue" }, tip_size_mm: { op: "lte", value: 0.7 } },
 *   tags: ["usecase:school-prep"],
 *   brandIds: [5, 12]
 * }
 */
export interface MatchRulesDraft {
  attributes?: Record<
    string,
    { op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in"; value: unknown }
  >;
  tags?: string[];
  brandIds?: number[];
}

// ─── School Lists ────────────────────────────────────────────────────────────

/**
 * school_lists
 *
 * Each row represents a school supply list for a specific school, grade, and year.
 * Parents access it via deep link: /school/{slug}
 */
export const schoolLists = pgTable("school_lists", {
  id: serial("id").primaryKey(),

  /** Deep-link key (e.g., "cairo-intl-kg1-2025") */
  slug: text("slug").notNull().unique(),

  /** School name */
  schoolName: text("school_name").notNull(),

  /** Grade level (e.g., "KG1", "Grade 3") */
  grade: text("grade").notNull(),

  /** Academic year (e.g., "2025-2026") */
  academicYear: text("academic_year").notNull(),

  /** Governorate (e.g., "Cairo", "Alexandria") */
  governorate: text("governorate"),

  /** Area/Neighborhood (e.g., "Maadi", "Zamalek") */
  area: text("area"),

  /** School type (e.g., "National", "International") */
  schoolType: text("school_type"),

  /** Academic system (e.g., "American", "British", "IGCSE") */
  academicSystem: text("academic_system"),

  /** Localized display title */
  localizedTitle: jsonb("localized_title").$type<LocalizedStringDraft>().notNull(),

  /** Optional localized description */
  localizedDescription: jsonb("localized_description").$type<LocalizedStringDraft>(),

  /** Hero banner image */
  heroImageUrl: text("hero_image_url"),

  /** Whether the list is published and visible */
  isActive: boolean("is_active").default(true).notNull(),

  /** When the list was made public */
  publishedAt: timestamp("published_at"),

  /** Access mode (public, code_required, private) */
  accessMode: text("access_mode").default("public").notNull(),

  /** Hashed code for access (only for code_required mode) */
  accessCode: text("access_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── School List Items ───────────────────────────────────────────────────────

/**
 * school_list_items
 *
 * Each row represents one required item in a school list.
 * E.g., "Blue ink pen 0.7mm × 2"
 *
 * - is_locked=true → parent can ONLY choose from pre-curated alternatives
 * - is_locked=false → alternatives are suggestions; match_rules can auto-discover more
 */
export const schoolListItems = pgTable(
  "school_list_items",
  {
    id: serial("id").primaryKey(),

    schoolListId: integer("school_list_id")
      .notNull()
      .references(() => schoolLists.id, { onDelete: "cascade" }),

    /** Ordering within the list */
    displayOrder: integer("display_order").default(0).notNull(),

    /** What the school calls the item: "Blue ink pen 0.7mm" */
    localizedLabel: jsonb("localized_label").$type<LocalizedStringDraft>().notNull(),

    /** Intent category (e.g., Pens) — used for matching */
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),

    /** How many the child needs */
    quantityRequired: integer("quantity_required").default(1).notNull(),

    /** If true, only pre-curated alternatives are allowed */
    isLocked: boolean("is_locked").default(false).notNull(),

    /** Structured attribute filters for auto-matching variants */
    matchRules: jsonb("match_rules").$type<MatchRulesDraft>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxSchoolListItemsList: index("idx_school_list_items_list").on(table.schoolListId),
  }),
);

// ─── School List Item Alternatives ───────────────────────────────────────────

/**
 * school_list_item_alternatives
 *
 * Pre-curated SKU options for each list item.
 * The `is_default` flag marks the pre-selected option.
 */
export const schoolListItemAlternatives = pgTable(
  "school_list_item_alternatives",
  {
    id: serial("id").primaryKey(),

    listItemId: integer("list_item_id")
      .notNull()
      .references(() => schoolListItems.id, { onDelete: "cascade" }),

    /** Specific variant (SKU) */
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),

    /** Whether this option is pre-selected */
    isDefault: boolean("is_default").default(false).notNull(),

    /** Sort order among alternatives */
    displayOrder: integer("display_order").default(0).notNull(),
  },
  (table) => ({
    uqAlternative: uniqueIndex("uq_school_alternative").on(table.listItemId, table.variantId),
    idxAlternativesItem: index("idx_school_alternatives_item").on(table.listItemId),
    idxAlternativesVariant: index("idx_school_alternatives_variant").on(table.variantId),
  }),
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const schoolListsRelations = relations(schoolLists, ({ many }) => ({
  items: many(schoolListItems),
}));

export const schoolListItemsRelations = relations(schoolListItems, ({ one, many }) => ({
  schoolList: one(schoolLists, {
    fields: [schoolListItems.schoolListId],
    references: [schoolLists.id],
  }),
  category: one(categories, {
    fields: [schoolListItems.categoryId],
    references: [categories.id],
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

// ─── Type Exports ────────────────────────────────────────────────────────────

export type SchoolList = typeof schoolLists.$inferSelect;
export type NewSchoolList = typeof schoolLists.$inferInsert;
export type SchoolListItem = typeof schoolListItems.$inferSelect;
export type NewSchoolListItem = typeof schoolListItems.$inferInsert;
export type SchoolListItemAlternative = typeof schoolListItemAlternatives.$inferSelect;
export type NewSchoolListItemAlternative = typeof schoolListItemAlternatives.$inferInsert;
