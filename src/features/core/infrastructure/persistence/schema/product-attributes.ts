/**
 * Product Attributes Database Schema
 *
 * This file defines the schema for normalized, filterable product attributes.
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
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";
import type { LocalizedStringDraft } from "@/features/core/domain/value-objects";

/**
 * Attribute Definitions Table
 *
 * Registry of available attributes (specs) that can be assigned to products.
 * e.g., 'ink_color', 'tip_size_mm'
 */
export const attributeDefinitions = pgTable("attribute_definitions", {
  id: serial("id").primaryKey(),

  /** Unique identifier for the attribute (e.g. 'ink_color') */
  key: text("key").notNull().unique(),

  /** Type of data: 'string', 'number', 'boolean', 'enum' */
  dataType: text("data_type").notNull(),

  /** Optional unit suffix (e.g., 'mm', 'ml') */
  unit: text("unit"),

  /** Localized display label */
  localizedLabel: jsonb("localized_label").$type<LocalizedStringDraft>().notNull(),

  /** Allowed values for 'enum' type */
  enumValues: jsonb("enum_values").$type<string[]>(),

  /** Hint for whether this attribute should appear in shop filters */
  isFilterable: boolean("is_filterable").default(true).notNull(),

  /** Whether this attribute is SPU-level, SKU-level, or both */
  scope: text("scope").default("product").notNull(),

  /** Sort order for display in spec sheets */
  sortOrder: integer("sort_order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Product Attributes Table
 *
 * Stores actual attribute values assigned to specific products.
 * Uses typed columns for performance (B-tree indexing).
 */
export const productAttributes = pgTable(
  "product_attributes",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    attributeId: integer("attribute_id")
      .notNull()
      .references(() => attributeDefinitions.id, { onDelete: "cascade" }),

    /** Storage for string or enum values */
    valueText: text("value_text"),

    /** Storage for numeric values */
    valueNum: decimal("value_num", { precision: 12, scale: 4 }),

    /** Storage for boolean values */
    valueBool: boolean("value_bool"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.attributeId] }),
    idxProduct: index("idx_product_attributes_product").on(table.productId),
    idxAttribute: index("idx_product_attributes_attr").on(table.attributeId),
    idxTextValue: index("idx_product_attributes_text").on(table.attributeId, table.valueText),
    idxNumValue: index("idx_product_attributes_num").on(table.attributeId, table.valueNum),
  }),
);

/**
 * Attribute Definition Relations
 */
export const attributeDefinitionsRelations = relations(attributeDefinitions, ({ many }) => ({
  productAttributes: many(productAttributes),
}));

/**
 * Product Attribute Relations
 */
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

export type AttributeDefinition = typeof attributeDefinitions.$inferSelect;
export type NewAttributeDefinition = typeof attributeDefinitions.$inferInsert;
export type ProductAttribute = typeof productAttributes.$inferSelect;
export type NewProductAttribute = typeof productAttributes.$inferInsert;
