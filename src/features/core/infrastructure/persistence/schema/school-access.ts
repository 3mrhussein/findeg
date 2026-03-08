/**
 * School List Access Database Schema
 *
 * Tracks permissions, requests, sharing tokens, and security attempts
 * for school supply lists.
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { schoolLists } from "./school-lists";

// ─── Access Grants ───────────────────────────────────────────────────────────

/**
 * school_list_access_grants
 *
 * Tracks which users have been granted access to which school lists.
 */
export const schoolListAccessGrants = pgTable(
  "school_list_access_grants",
  {
    id: serial("id").primaryKey(),

    listId: integer("list_id")
      .notNull()
      .references(() => schoolLists.id, { onDelete: "cascade" }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** How the access was granted: "token" | "code" | "request" | "admin" */
    grantedVia: varchar("granted_via", { length: 20 }).notNull(),

    grantedAt: timestamp("granted_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => ({
    uqGrant: uniqueIndex("uq_school_access_grant").on(table.listId, table.userId),
    idxGrantUser: index("idx_school_access_grant_user").on(table.userId),
    idxGrantList: index("idx_school_access_grant_list").on(table.listId),
  }),
);

// ─── Access Requests ─────────────────────────────────────────────────────────

/**
 * school_list_access_requests
 *
 * Tracks user requests for access to private/restricted lists.
 */
export const schoolListAccessRequests = pgTable(
  "school_list_access_requests",
  {
    id: serial("id").primaryKey(),

    listId: integer("list_id")
      .notNull()
      .references(() => schoolLists.id, { onDelete: "cascade" }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** Optional child name for context */
    childName: text("child_name"),

    /** Optional note from the parent */
    note: text("note"),

    /** Denormalized for quick reference */
    parentName: text("parent_name").notNull(),
    parentEmail: text("parent_email").notNull(),

    /** "pending" | "approved" | "rejected" */
    status: varchar("status", { length: 20 }).default("pending").notNull(),

    reviewedBy: integer("reviewed_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    idxRequestUser: index("idx_school_access_request_user").on(table.userId),
    idxRequestList: index("idx_school_access_request_list").on(table.listId),
    idxRequestStatus: index("idx_school_access_request_status").on(table.status),
  }),
);

// ─── Access Tokens ───────────────────────────────────────────────────────────

/**
 * school_list_access_tokens
 *
 * Generates shareable "tokenized" links for auto-granting access.
 */
export const schoolListAccessTokens = pgTable(
  "school_list_access_tokens",
  {
    id: serial("id").primaryKey(),

    listId: integer("list_id")
      .notNull()
      .references(() => schoolLists.id, { onDelete: "cascade" }),

    /** The secure random token string */
    token: varchar("token", { length: 128 }).notNull().unique(),

    /** Human-readable label (e.g., "WhatsApp Group Link") */
    label: text("label"),

    maxUses: integer("max_uses"),
    useCount: integer("use_count").default(0).notNull(),

    expiresAt: timestamp("expires_at"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    idxTokenList: index("idx_school_access_token_list").on(table.listId),
    idxTokenStr: index("idx_school_access_token_str").on(table.token),
  }),
);

// ─── Code Attempts ───────────────────────────────────────────────────────────

/**
 * school_list_code_attempts
 *
 * Implements security rate-limiting for code entry.
 */
export const schoolListCodeAttempts = pgTable(
  "school_list_code_attempts",
  {
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
  },
  (table) => ({
    uqAttempt: uniqueIndex("uq_school_code_attempt").on(table.listId, table.userId),
  }),
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const schoolListAccessGrantsRelations = relations(schoolListAccessGrants, ({ one }) => ({
  list: one(schoolLists, {
    fields: [schoolListAccessGrants.listId],
    references: [schoolLists.id],
  }),
  user: one(users, {
    fields: [schoolListAccessGrants.userId],
    references: [users.id],
  }),
}));

export const schoolListAccessRequestsRelations = relations(schoolListAccessRequests, ({ one }) => ({
  list: one(schoolLists, {
    fields: [schoolListAccessRequests.listId],
    references: [schoolLists.id],
  }),
  user: one(users, {
    fields: [schoolListAccessRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [schoolListAccessRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const schoolListAccessTokensRelations = relations(schoolListAccessTokens, ({ one }) => ({
  list: one(schoolLists, {
    fields: [schoolListAccessTokens.listId],
    references: [schoolLists.id],
  }),
  user: one(users, {
    fields: [schoolListAccessTokens.createdBy],
    references: [users.id],
  }),
}));

export const schoolListCodeAttemptsRelations = relations(schoolListCodeAttempts, ({ one }) => ({
  list: one(schoolLists, {
    fields: [schoolListCodeAttempts.listId],
    references: [schoolLists.id],
  }),
  user: one(users, {
    fields: [schoolListCodeAttempts.userId],
    references: [users.id],
  }),
}));

// Add references back to schoolLists if needed (optional since schoolLists doesn't strictly need to see its grants for standard queries)

// ─── Type Exports ────────────────────────────────────────────────────────────

export type SchoolListAccessGrant = typeof schoolListAccessGrants.$inferSelect;
export type NewSchoolListAccessGrant = typeof schoolListAccessGrants.$inferInsert;

export type SchoolListAccessRequest = typeof schoolListAccessRequests.$inferSelect;
export type NewSchoolListAccessRequest = typeof schoolListAccessRequests.$inferInsert;

export type SchoolListAccessToken = typeof schoolListAccessTokens.$inferSelect;
export type NewSchoolListAccessToken = typeof schoolListAccessTokens.$inferInsert;

export type SchoolListCodeAttempt = typeof schoolListCodeAttempts.$inferSelect;
export type NewSchoolListCodeAttempt = typeof schoolListCodeAttempts.$inferInsert;
