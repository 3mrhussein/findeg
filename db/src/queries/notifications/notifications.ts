/**
 * Query Primitives for Notifications
 *
 * Pure database queries for notification operations.
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. No domain mapping needed - domain types match DB schema.
 */

import { db } from '../../connection';
import { notifications } from '../../schema';
import { eq, and, desc, count } from 'drizzle-orm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationRow = typeof notifications.$inferSelect;

export interface CreateNotificationInput {
  userId: number;
  titleEn: string;
  titleAr: string;
  bodyEn?: string | null;
  bodyAr?: string | null;
  actionUrl?: string | null;
  type: string;
  isRead?: boolean;
  createdAt?: Date;
}

// ─── Write Operations ────────────────────────────────────────────────────────

/**
 * Create a new notification
 */
export async function create(data: CreateNotificationInput): Promise<void> {
  await db.insert(notifications).values(data);
}

/**
 * Mark a specific notification as read
 */
export async function markRead(id: number, userId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllRead(userId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ─── Read Operations ─────────────────────────────────────────────────────────

/**
 * Get latest unread notifications for a user
 */
export async function getUnread(userId: number, limit: number = 5): Promise<NotificationRow[]> {
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/**
 * Get all notifications with optional filtering and pagination
 */
export async function getAll(
  userId: number,
  page: number,
  perPage: number,
  unreadOnly?: boolean,
): Promise<NotificationRow[]> {
  const filters = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    filters.push(eq(notifications.isRead, false));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...filters))
    .orderBy(desc(notifications.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage);
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: number): Promise<number> {
  const [result] = await db
    .select({ val: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result?.val || 0;
}
