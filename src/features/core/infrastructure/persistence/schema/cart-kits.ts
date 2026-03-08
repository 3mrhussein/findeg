import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { schoolLists } from "./school-lists";
import { schoolListParentSessions } from "./school-list-sessions";

/**
 * cart_kits
 *
 * Groups items in a cart that belong to a specific school list customization.
 */
export const cartKits = pgTable("cart_kits", {
  id: serial("id").primaryKey(),

  cartId: integer("cart_id").notNull(), // Assuming cart is tracked by ID, we'll see if it needs a FK later

  schoolListId: integer("school_list_id")
    .notNull()
    .references(() => schoolLists.id, { onDelete: "cascade" }),

  parentSessionId: integer("parent_session_id").references(() => schoolListParentSessions.id, {
    onDelete: "set null",
  }),

  displayName: text("display_name").notNull(),
  schoolName: text("school_name").notNull(),
  gradeLabel: text("grade_label").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CartKit = typeof cartKits.$inferSelect;
export type NewCartKit = typeof cartKits.$inferInsert;
