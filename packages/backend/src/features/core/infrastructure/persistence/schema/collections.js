/**
 * Product Collections Schema
 *
 * Supports manually curated collections (e.g., "Back to School", "Office Essentials").
 */
import { serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tags } from "./tags";
import { catalogSchema } from "./schemas";
/**
 * Collections Table
 *
 * Used for creating marketing-driven groups of products.
 */
export const collections = catalogSchema.table("collections", {
    id: serial("id").primaryKey(),
    /** Unique slug for collection URLs */
    slug: text("slug").notNull().unique(),
    /** Metadata for display */
    localizedTitle: jsonb("localized_title").$type().default({}).notNull(),
    localizedSubtitle: jsonb("localized_subtitle").$type(),
    /** Optional hero image for the collection page */
    heroImageUrl: text("hero_image_url"),
    /** Display order (lower = first) */
    sortOrder: integer("sort_order").default(0).notNull(),
    /** Whether the collection is published */
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
/**
 * Collection Tags (Join Table)
 *
 * Collections can be linked to multiple tags for flexible categorization.
 */
export const collectionTags = catalogSchema.table("collection_tags", {
    collectionId: integer("collection_id")
        .notNull()
        .references(() => collections.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
        .notNull()
        .references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: { columns: [table.collectionId, table.tagId] },
}));
/**
 * Relations
 */
export const collectionsRelations = relations(collections, ({ many }) => ({
    tags: many(collectionTags),
}));
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
