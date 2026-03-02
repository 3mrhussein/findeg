/**
 * Discount Rules Database Schema
 *
 * Extracted from the JSONB `discount_rules` column on `products` into a
 * proper normalized table. Supports scoped discounts (product, category,
 * brand, global) and customer-group targeting.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * discount_rules
 *
 * Each row defines a discount that can be applied to products at checkout
 * or display time. Scoped to a specific product, category, brand, or global.
 *
 * Examples:
 * - 10% off all pens (scope='category', scope_id=5)
 * - EGP 5 off Stabilo brand (scope='brand', scope_id=2)
 * - 15% off everything for wholesale (scope='global', customer_group='wholesale')
 */
export const discountRules = pgTable(
  "discount_rules",
  {
    id: serial("id").primaryKey(),

    /** Machine-friendly unique code (e.g., 'BTS2025_10OFF') */
    code: text("code").notNull().unique(),

    /** Admin display name */
    name: text("name").notNull(),

    /** Discount type: 'percentage' or 'fixed' */
    type: text("type").notNull(),

    /** Discount value (percentage 0-100. or fixed amount) */
    value: decimal("value", { precision: 12, scale: 2 }).notNull(),

    /** Currency code — required when type='fixed' */
    currency: text("currency"),

    /** What entity this discount applies to */
    scope: text("scope").default("product").notNull(),

    /** ID of the scoped entity (product/category/brand ID). Null for global scope. */
    scopeId: integer("scope_id"),

    /** Restrict to a customer group. Null = applies to all groups. */
    customerGroup: text("customer_group"),

    /** Higher priority rules are evaluated first */
    priority: integer("priority").default(0).notNull(),

    /** When the discount becomes active */
    startsAt: timestamp("starts_at"),

    /** When the discount expires */
    endsAt: timestamp("ends_at"),

    /** Master on/off switch */
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxDiscountRulesScope: index("idx_discount_rules_scope").on(table.scope, table.scopeId),
    idxDiscountRulesActive: index("idx_discount_rules_active").on(
      table.isActive,
      table.startsAt,
      table.endsAt,
    ),
    idxDiscountRulesGroup: index("idx_discount_rules_group").on(table.customerGroup),
  }),
);

// ─── Type Exports ────────────────────────────────────────────────────────────

export type DiscountRuleRow = typeof discountRules.$inferSelect;
export type NewDiscountRuleRow = typeof discountRules.$inferInsert;
