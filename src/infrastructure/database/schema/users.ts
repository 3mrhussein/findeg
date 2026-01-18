/**
 * Users Database Schema
 *
 * Defines user accounts, authentication data, and session preferences.
 */

import { pgTable, serial, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
  password: text("password"), // Hashed password
  role: varchar("role", { length: 20 }).default("user").notNull(), // user, admin
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  // Define relations for orders and reviews when those schemas are ready
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
