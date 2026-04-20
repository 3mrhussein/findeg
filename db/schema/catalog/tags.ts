/**
 * Product Tags and Tagging Join Tables
 *
 * Tags are many-to-many labels for products.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { catalogSchema } from "../schemas";
import { products } from "./products";

/**
 * Tags Table
 */
export const tags = catalogSchema.table(
  "tags",
  {
    id: serial("id").primaryKey(),
    group: text("group").notNull(),
    key: text("key").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
    color: text("color"),
    isActive: boolean("is_active").default(true).notNull(),
    scope: text("scope").default("catalog").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("uq_tags_group_key").on(table.group, table.key)],
);

/**
 * Product Tags Join Table
 */
export const productTags = catalogSchema.table("product_tags", {
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

/**
 * Relations
 */
export const tagsRelations = relations(tags, ({ many }) => ({
  products: many(productTags),
}));

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
