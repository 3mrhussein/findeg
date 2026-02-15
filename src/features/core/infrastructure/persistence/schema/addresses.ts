/**
 * Addresses Database Schema
 *
 * Stores customer shipping/billing addresses in Egyptian format.
 * Each user can have multiple addresses with one marked as default.
 */

import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/**
 * Addresses Table
 *
 * Multi-field Egyptian address format:
 * - `label` — User-defined address nickname (e.g., "Home", "Office")
 * - City → Area → Street → Building → Floor → Apartment
 * - `isDefault` — One default address per user
 */
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").default("Home").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  street: text("street").notNull(),
  building: text("building"),
  floor: text("floor"),
  apartment: text("apartment"),
  notes: text("notes"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Address Relations
 *
 * Each address belongs to one user.
 */
export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

/**
 * Type Exports
 */
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
