import { Notification } from "@backend/features/core/infrastructure/persistence/schema/notifications";

/**
 * Interface for the Notification Application Service
 */
export interface INotificationService {
  /**
   * Creates an in-app notification.
   * Fire-and-forget: should not throw or block business flows.
   */
  create(params: {
    userId: number;
    type: string;
    titleEn: string;
    titleAr: string;
    bodyEn?: string;
    bodyAr?: string;
    actionUrl?: string;
  }): Promise<void>;

  /** Marks a notification as read */
  markRead(notificationId: number, userId: number): Promise<void>;

  /** Marks all for a user as read */
  markAllRead(userId: number): Promise<void>;

  /** Gets latest unread for the user */
  getUnread(userId: number): Promise<Notification[]>;

  /** Gets all notifications for the user with pagination */
  getAll(
    userId: number,
    page?: number,
  ): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }>;

  /** Gets the badge count */
  getUnreadCount(userId: number): Promise<number>;
}
