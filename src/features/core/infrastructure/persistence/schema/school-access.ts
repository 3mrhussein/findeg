/**
 * School Access Database Schema
 */

import { pgTable, serial, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { schoolEngineSchema } from "./schemas";
import { schoolLists } from "./school-lists";
import { users } from "./users";

/**
 * school_list_access_grants
 */
export const schoolListAccessGrants = schoolEngineSchema.table("school_list_access_grants", {
  id: serial("id").primaryKey(),
  listId: integer("list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  grantedVia: varchar("granted_via", { length: 20 }).notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

/**
 * school_list_access_requests
 */
export const schoolListAccessRequests = schoolEngineSchema.table("school_list_access_requests", {
  id: serial("id").primaryKey(),
  listId: integer("list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  childName: text("child_name"),
  note: text("note"),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * school_list_access_tokens
 */
export const schoolListAccessTokens = schoolEngineSchema.table("school_list_access_tokens", {
  id: serial("id").primaryKey(),
  listId: integer("list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 128 }).notNull().unique(),
  label: text("label"),
  maxUses: integer("max_uses"),
  useCount: integer("use_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * school_list_code_attempts
 */
export const schoolListCodeAttempts = schoolEngineSchema.table("school_list_code_attempts", {
  id: serial("id").primaryKey(),
  listId: integer("list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SchoolListAccessGrant = typeof schoolListAccessGrants.$inferSelect;
export type NewSchoolListAccessGrant = typeof schoolListAccessGrants.$inferInsert;
export type SchoolListAccessRequest = typeof schoolListAccessRequests.$inferSelect;
export type NewSchoolListAccessRequest = typeof schoolListAccessRequests.$inferInsert;
export type SchoolListAccessToken = typeof schoolListAccessTokens.$inferSelect;
export type SchoolListCodeAttempt = typeof schoolListCodeAttempts.$inferSelect;
