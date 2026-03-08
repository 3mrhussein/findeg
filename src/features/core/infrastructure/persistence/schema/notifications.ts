/**
 * Notifications Database Schema
 *
 * Stores in-app notifications for users and admins.
 */

import { pgTable, serial, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

/**
 * Notifications Table
 *
 * Fields:
 * - `userId` — The recipient of the notification
 * - `type` — The event type (e.g., "order.created", "inventory.low_stock")
 * - `titleEn` / `titleAr` — Localized titles
 * - `bodyEn` / `bodyAr` — Localized message bodies (optional)
 * - `actionUrl` — Link to the relevant page (e.g., order detail, review moderate)
 * - `isRead` — Read status tracking
 */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),
    bodyEn: text("body_en"),
    bodyAr: text("body_ar"),
    actionUrl: text("action_url"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userReadIdx: index("notifications_user_read_idx").on(
      table.userId,
      table.isRead,
      table.createdAt,
    ),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
