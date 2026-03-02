/**
 * Tags Database Schema
 *
 * This file defines the database schema for the flexible tagging system.
 * Tags are used for cross-cutting concerns like use-cases, styles, and collections.
 */

import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  primaryKey,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import type { LocalizedStringDraft } from "@/features/core/domain/value-objects";

/**
 * Tags Table
 *
 * Stores tag definitions grouped by type (e.g., 'usecase', 'audience').
 */
export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),

    /** Grouping discriminator: 'usecase', 'audience', 'style', 'season', etc. */
    group: text("group").notNull(),

    /** unique business key within the group (e.g., 'back-to-school') */
    key: text("key").notNull(),

    /** Localized label for display */
    localizedLabel: jsonb("localized_label").$type<LocalizedStringDraft>().notNull(),

    /** Optional localized description */
    description: jsonb("description").$type<LocalizedStringDraft>(),

    /** Material Symbols icon name */
    icon: text("icon"),

    /** Optional color token for UI badges */
    color: text("color"),

    /** Whether the tag targets products, variants, or collections */
    scope: text("scope").default("product").notNull(),

    /** Whether the tag is active and visible */
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqGroupKey: uniqueIndex("uq_tags_group_key").on(table.group, table.key),
  }),
);

/**
 * Product Tags Join Table
 *
 * Many-to-many relationship between products and tags.
 */
export const productTags = pgTable(
  "product_tags",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
    idxProduct: index("idx_product_tags_product").on(table.productId),
    idxTag: index("idx_product_tags_tag").on(table.tagId),
  }),
);

/**
 * Tag Relations
 */
export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
}));

/**
 * Product Tag Relations
 */
export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
