/**
 * Users Database Schema
 *
 * Defines user accounts, authentication data, and session preferences.
 * Supports both registered users and admin roles.
 */

import { pgTable, serial, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";
import { reviews } from "./reviews";
import { addresses } from "./addresses";
import { auditLog } from "./audit-log";
import type { UserRole } from "@/features/core/domain/types/common";

/**
 * Users Table
 *
 * Fields:
 * - `email` — Unique login identifier
 * - `firstName` / `lastName` — Separate name fields for proper display
 * - `name` — Legacy display name (kept for backward compatibility)
 * - `phone` — Egyptian phone number (for delivery coordination)
 * - `role` — "user" or "admin"
 * - `isActive` — Account status toggle
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  /** First name for personalization and address forms */
  firstName: text("first_name"),
  /** Last name */
  lastName: text("last_name"),
  /** Legacy display name — kept for backward compatibility */
  name: text("name"),
  /** Egyptian phone number (e.g., "+201234567890") */
  phone: varchar("phone", { length: 20 }),

  password: text("password"),
  /** User role: "user" or "admin" */
  role: varchar("role", { length: 20 }).$type<UserRole>().default("user").notNull(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * User Relations
 *
 * Users can have:
 * - orders: Purchase history
 * - reviews: Product reviews
 * - addresses: Saved shipping addresses
 * - auditLogs: Admin action history (only for admin users)
 */
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
  addresses: many(addresses),
  auditLogs: many(auditLog, { relationName: "user_audit_logs" }),
}));

// We can also define the other side here if Drizzle supports it in one relations() call,
// but usually it's per table. The key is that audit-log.ts no longer imports users.ts.

/**
 * Type Exports
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
