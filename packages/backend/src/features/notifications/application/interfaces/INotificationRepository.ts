import { ID } from "@/features/core/domain/types/common";
import {
  Notification,
  NewNotification,
} from "@/features/core/infrastructure/persistence/schema/notifications";

/**
 * Data Access Interface for Notifications
 */
export interface INotificationRepository {
  /** Creates a new notification */
  create(data: NewNotification): Promise<void>;

  /** Marks a specific notification as read */
  markRead(id: number, userId: number): Promise<void>;

  /** Marks all notifications for a user as read */
  markAllRead(userId: number): Promise<void>;

  /** Gets latest unread notifications */
  getUnread(userId: number, limit?: number): Promise<Notification[]>;

  /** Gets all notifications with pagination */
  getAll(
    userId: number,
    page: number,
    perPage: number,
    unreadOnly?: boolean,
  ): Promise<Notification[]>;

  /** Gets total count of unread notifications */
  getUnreadCount(userId: number): Promise<number>;
}
