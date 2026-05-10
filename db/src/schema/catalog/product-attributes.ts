/**
 * Product Attributes Schema
 */

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  jsonb,
  decimal,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { catalogSchema } from "../schemas";
import { products } from "./products";

/**
 * Global Attribute Definitions (e.g., "Color", "Size", "Material")
 */
export const attributes = catalogSchema.table("attributes", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., "ink-color"
  dataType: text("data_type").notNull(), // 'text', 'color', 'number'
  unit: text("unit"),
  localizedLabel: jsonb("localized_label").notNull(),
  enumValues: jsonb("enum_values"),
  isFilterable: boolean("is_filterable").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Product-specific attribute assignments (SPU level)
 */
export const productAttributes = catalogSchema.table(
  "product_attributes",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    attributeId: integer("attribute_id") // Original name
      .notNull()
      .references(() => attributes.id, { onDelete: "cascade" }),

    valueText: text("value_text"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.attributeId] }),
    index("idx_product_attributes_product").on(table.productId),
    index("idx_product_attributes_attr").on(table.attributeId),
  ],
);

/**
 * Relations
 */
export const attributesRelations = relations(attributes, ({ many }) => ({
  productAssignments: many(productAttributes),
}));

export const productAttributesRelations = relations(productAttributes, ({ one }) => ({
  product: one(products, {
    fields: [productAttributes.productId],
    references: [products.id],
  }),
  definition: one(attributes, {
    fields: [productAttributes.attributeId],
    references: [attributes.id],
  }),
}));

// ─── Type Exports ────────────────────────────────────────────────────────────

export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;
export type ProductAttribute = typeof productAttributes.$inferSelect;
export type NewProductAttribute = typeof productAttributes.$inferInsert;
