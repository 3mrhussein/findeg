import { pgTable, serial, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { identitySchema } from "./schemas";
import { orders } from "./orders";
import { reviews } from "./reviews";
import { addresses } from "./addresses";
import { auditLog } from "./audit-log";

/**
 * Users Table
 *
 * Fields:
 * - `email` — Unique login identifier
 * - `firstName` / `lastName` — Separate name fields for proper display
 * - `phone` — Egyptian phone number (for delivery coordination)
 * - `role` — "user" or "admin"
 * - `isActive` — Account status toggle
 */
export const users = identitySchema.table("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  /** First name for personalization and address forms */
  firstName: text("first_name"),
  /** Last name */
  lastName: text("last_name"),
  /** Egyptian phone number (e.g., "+201234567890") */
  phone: varchar("phone", { length: 20 }),
  verifiedPhone: boolean("verified_phone").default(false).notNull(),
  /** Portal routing gate: "customer" | "staff" | "school_staff" */
  portalRole: varchar("portal_role", { length: 20 }).default("customer").notNull(),
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

/**
 * Type Exports
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
