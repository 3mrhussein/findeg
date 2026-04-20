import { db } from "@findeg/db";
import {
  notifications,
  Notification,
  NewNotification,
} from "@findeg/db/schema";
import { INotificationRepository } from "../application/interfaces/INotificationRepository";
import { eq, and, desc, count } from "drizzle-orm";

/**
 * Drizzle implementation of the Notification Repository.
 */
export class DrizzleNotificationRepository implements INotificationRepository {
  /**
   *
   */
  async create(data: NewNotification): Promise<void> {
    await db.insert(notifications).values(data);
  }

  /**
   *
   */
  async markRead(id: number, userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  /**
   *
   */
  async markAllRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  /**
   *
   */
  async getUnread(userId: number, limit: number = 5): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  /**
   *
   */
  async getAll(
    userId: number,
    page: number,
    perPage: number,
    unreadOnly?: boolean,
  ): Promise<Notification[]> {
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
   *
   */
  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ val: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.val;
  }
}
