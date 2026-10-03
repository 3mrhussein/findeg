/**
 * Notification Services Factory (Pure TypeScript - Framework Agnostic)
 */

import { NotificationService } from './NotificationService';
import { NotificationEventService } from './NotificationEventService';

/**
 * Create notification services with all dependencies wired
 *
 * @returns Object containing all notification service instances
 */
export function createNotificationServices() {
  const notifications = new NotificationService();

  return {
    notifications,
    events: new NotificationEventService(notifications),
  };
}

/**
 * Type helper for notification services
 */
export type NotificationServices = ReturnType<typeof createNotificationServices>;
