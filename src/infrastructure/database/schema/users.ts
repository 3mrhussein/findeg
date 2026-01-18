/**
 * User Database Schema
 */

import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Users Table
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * User Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  // Add relations here (e.g., orders, reviews)
}));

/**
 * Type Exports
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
