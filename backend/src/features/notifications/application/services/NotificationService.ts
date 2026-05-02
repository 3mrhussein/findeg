import { INotificationService } from "../interfaces/INotificationService";
import { INotificationRepository } from "../interfaces/INotificationRepository";
import { Notification } from "@findeg/db/schema";

/**
 * Notification Application Service
 * Coordinates in-app notification logic.
 */
export class NotificationService implements INotificationService {
  /**
   *
   */
  constructor(private repo: INotificationRepository) {}

  /**
   *
   */
  async create(params: {
    userId: number;
    type: string;
    titleEn: string;
    titleAr: string;
    bodyEn?: string;
    bodyAr?: string;
    actionUrl?: string;
  }): Promise<void> {
    try {
      await this.repo.create({
        ...params,
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      // Fire-and-forget: log but don't crash
      console.error("[NotificationService] Create failed:", error);
    }
  }

  /**
   *
   */
  async markRead(notificationId: number, userId: number): Promise<void> {
    await this.repo.markRead(notificationId, userId);
  }

  /**
   *
   */
  async markAllRead(userId: number): Promise<void> {
    await this.repo.markAllRead(userId);
  }

  /**
   *
   */
  async getUnread(userId: number): Promise<Notification[]> {
    return this.repo.getUnread(userId, 5);
  }

  /**
   *
   */
  async getAll(
    userId: number,
    page: number = 1,
  ): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    const perPage = 20;
    const notifications = await this.repo.getAll(userId, page, perPage);

    // We can optimize this by getting count separately or just checking limit
    return {
      notifications,
      total: 0, // Should probably be actual total if needed for pagination
      hasMore: notifications.length === perPage,
    };
  }

  /**
   *
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }
}
