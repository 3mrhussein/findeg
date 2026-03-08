import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { schoolLists } from "./school-lists";
import { users } from "./users";

/**
 * school_list_parent_sessions
 *
 * Tracks the "state" of a parent's customized list.
 * Saves brand swaps and optional item selections.
 */
export const schoolListParentSessions = pgTable(
  "school_list_parent_sessions",
  {
    id: serial("id").primaryKey(),

    listId: integer("list_id")
      .notNull()
      .references(() => schoolLists.id, { onDelete: "cascade" }),

    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),

    /** Session token for guest users */
    sessionToken: text("session_token"),

    /**
     * Map of item ID to selected variant ID
     * Example: { "12": 450, "15": 982 }
     */
    itemSelections: jsonb("item_selections").$type<Record<string, number>>().default({}).notNull(),

    /** IDs of optional items that were explicitly added */
    optionalInclusions: integer("optional_inclusions").array().default([]).notNull(),

    /** IDs of optional items that were explicitly removed (if ever relevant) */
    optionalExclusions: integer("optional_exclusions").array().default([]).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uqUserSession: uniqueIndex("uq_school_parent_user_session").on(table.listId, table.userId),
    uqGuestSession: uniqueIndex("uq_school_parent_guest_session").on(
      table.listId,
      table.sessionToken,
    ),
    idxUser: index("idx_school_parent_session_user").on(table.userId),
    idxToken: index("idx_school_parent_session_token").on(table.sessionToken),
  }),
);

export type SchoolListParentSession = typeof schoolListParentSessions.$inferSelect;
export type NewSchoolListParentSession = typeof schoolListParentSessions.$inferInsert;
