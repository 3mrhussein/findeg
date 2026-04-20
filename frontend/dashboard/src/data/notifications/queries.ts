/**
 * Notifications Data Layer (Dashboard)
 *
 * Provides cached data for admin notifications.
 * Adheres to Next.js 16 "use cache" standards.
 */
"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { createNotificationServices } from "@findeg/backend/features/notifications";

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: number) {
  cacheTag(`notifications-user-${userId}`, "notifications-unread");
  cacheLife("minutes");

  const { notifications } = createNotificationServices();
  return await notifications.getUnread(userId);
}

/**
 * Get paginated notifications for a user
 */
export async function getAllNotifications(userId: number, page: number = 1) {
  cacheTag(`notifications-user-${userId}`);
  cacheLife("hours");

  const { notifications } = createNotificationServices();
  return await notifications.getAll(userId, page);
}

/**
 * Get notification badge count
 */
export async function getNotificationCount(userId: number) {
  cacheTag(`notifications-user-${userId}`, "notifications-count");
  cacheLife("minutes");

  const { notifications } = createNotificationServices();
  return await notifications.getUnreadCount(userId);
}
