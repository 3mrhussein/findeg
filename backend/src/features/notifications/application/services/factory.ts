/**
 * Notification Services Factory (Pure TypeScript - Framework Agnostic)
 */

import { createNotificationInbox } from '@findeg/identity';
import { NotificationEventService } from './NotificationEventService';

/**
 * Create notification services with all dependencies wired
 *
 * @returns Object containing all notification service instances
 */
export function createNotificationServices() {
  const notifications = createNotificationInbox();

  return {
    notifications,
    events: new NotificationEventService(notifications),
  };
}

/**
 * Type helper for notification services
 */
export type NotificationServices = ReturnType<typeof createNotificationServices>;
