/**
 * School List Sessions Database Schema
 */

import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { schoolEngineSchema } from "../schemas";
import { schoolLists } from "./school-lists";
import { users } from "../identity/users";

/**
 * school_list_parent_sessions
 *
 * Tracks user progress as they pick through a school list.
 */
export const schoolListParentSessions = schoolEngineSchema.table("school_list_parent_sessions", {
  id: serial("id").primaryKey(),

  listId: integer("list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),

  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),

  /** Shared session token for guest tracking */
  sessionToken: text("session_token"),

  /** JSON snapshot of user's current picks */
  itemSelections: jsonb("item_selections").$type<Record<string, any>>().default({}).notNull(),

  /** IDs of optional items the user HAS included/excluded */
  optionalInclusions: integer("optional_inclusions").array().default([]).notNull(),
  optionalExclusions: integer("optional_exclusions").array().default([]).notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SchoolListParentSession = typeof schoolListParentSessions.$inferSelect;
export type NewSchoolListParentSession = typeof schoolListParentSessions.$inferInsert;
export type SchoolListSession = SchoolListParentSession; // Alias for compatibility
export type NewSchoolListSession = NewSchoolListParentSession; // Alias for compatibility
