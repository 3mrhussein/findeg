/**
 * Discount Rules Database Schema
 */

import {
  pgTable,
  serial,
  text,
  decimal,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { salesSchema } from "./schemas";

/**
 * discount_rules
 */
export const discountRules = salesSchema.table("discount_rules", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),

  /** percentage or fixed */
  type: text("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),

  /** Minimum order amount to qualify */
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),

  /** Start and end dates for promotion */
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  /** Overall usage limit across all users */
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),

  /** Per-user usage limit */
  perUserLimit: integer("per_user_limit").default(1),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DiscountRule = typeof discountRules.$inferSelect;
export type NewDiscountRule = typeof discountRules.$inferInsert;
