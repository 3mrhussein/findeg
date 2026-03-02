/**
 * Collections Database Schema
 *
 * Collections are curated groupings of products powered by tags.
 */

import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  primaryKey,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tags } from "./tags";
import type { LocalizedStringDraft } from "@/features/core/domain/value-objects";

/**
 * Collections Table
 */
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),

  /** Unique URL slug (e.g., 'back-to-school') */
  slug: text("slug").notNull().unique(),

  /** Localized display title */
  localizedTitle: jsonb("localized_title").$type<LocalizedStringDraft>().notNull(),

  /** Optional localized subtitle/description for the hero section */
  localizedSubtitle: jsonb("localized_subtitle").$type<LocalizedStringDraft>(),

  /** Hero lifestyle image for collection pages */
  heroImageUrl: text("hero_image_url"),

  /** Order in lists/navigation */
  sortOrder: integer("sort_order").default(0).notNull(),

  /** Whether the collection is visible */
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Collection Tags Join Table
 *
 * Defines which tags power a collection (Rule-based OR matching).
 */
export const collectionTags = pgTable(
  "collection_tags",
  {
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.tagId] }),
  }),
);

/**
 * Collections Relations
 */
export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionTags: many(collectionTags),
}));

/**
 * Collection Tags Relations
 */
export const collectionTagsRelations = relations(collectionTags, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionTags.collectionId],
    references: [collections.id],
  }),
  tag: one(tags, {
    fields: [collectionTags.tagId],
    references: [tags.id],
  }),
}));

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
