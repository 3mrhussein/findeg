/**
 * Notifications Database Schema
 */

import { pgTable, serial, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { systemSchema } from "./schemas";

/**
 * Notifications Table
 */
export const notifications = systemSchema.table(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    /** Notification Titles */
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),

    /** Notification Content */
    bodyEn: text("body_en"),
    bodyAr: text("body_ar"),

    /** Target URL for notification action */
    actionUrl: text("action_url"),

    /** Type of notification (e.g., 'order_status', 'promo', 'system') */
    type: text("type").default("system").notNull(),

    isRead: boolean("is_read").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("notifications_user_id_idx").on(table.userId)],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
