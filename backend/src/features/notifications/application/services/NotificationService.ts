import { INotificationService } from '../interfaces/INotificationService';
import { Notification } from '../../domain/types/Notification';
import { notificationQueries } from '@findeg/db/queries';

/**
 * Notification Application Service
 * Coordinates in-app notification logic.
 */
export class NotificationService implements INotificationService {
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
      await notificationQueries.create({
        ...params,
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      // Fire-and-forget: log but don't crash
      console.error('[NotificationService] Create failed:', error);
    }
  }

  async markRead(notificationId: number, userId: number): Promise<void> {
    await notificationQueries.markRead(notificationId, userId);
  }

  async markAllRead(userId: number): Promise<void> {
    await notificationQueries.markAllRead(userId);
  }

  async getUnread(userId: number): Promise<Notification[]> {
    return notificationQueries.getUnread(userId, 5) as Promise<Notification[]>;
  }

  async getAll(
    userId: number,
    page: number = 1,
  ): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    const perPage = 20;
    const notificationsList = await notificationQueries.getAll(userId, page, perPage);

    return {
      notifications: notificationsList as Notification[],
      total: 0,
      hasMore: notificationsList.length === perPage,
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return notificationQueries.getUnreadCount(userId);
  }
}
