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
export const attributeDefinitions = catalogSchema.table("attribute_definitions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., "ink-color"
  dataType: text("data_type").notNull(), // 'text', 'color', 'number'
  unit: text("unit"),
  localizedLabel: jsonb("localized_label").notNull(),
  enumValues: jsonb("enum_values"),
  scope: text("scope").default("product").notNull(),
  isFilterable: boolean("is_filterable").default(true).notNull(),
  /** When true, the attribute contributes to the variant key (VariantKey.build()) */
  isVariantDefining: boolean("is_variant_defining").default(false).notNull(),
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
      .references(() => attributeDefinitions.id, { onDelete: "cascade" }),

    valueText: text("value_text"),
    valueNum: decimal("value_num", { precision: 12, scale: 4 }),
    valueBool: boolean("value_bool"),

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
export const attributeDefinitionsRelations = relations(attributeDefinitions, ({ many }) => ({
  productAssignments: many(productAttributes),
}));

export const productAttributesRelations = relations(productAttributes, ({ one }) => ({
  product: one(products, {
    fields: [productAttributes.productId],
    references: [products.id],
  }),
  definition: one(attributeDefinitions, {
    fields: [productAttributes.attributeId],
    references: [attributeDefinitions.id],
  }),
}));
