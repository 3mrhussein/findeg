/**
 * Notification Services Factory (Pure TypeScript - Framework Agnostic)
 */

import { NotificationService } from './NotificationService';
import { NotificationEventService } from './NotificationEventService';
import { ResendEmailService } from '../../infrastructure/ResendEmailService';

/**
 * Create notification services with all dependencies wired
 *
 * @returns Object containing all notification service instances
 */
export function createNotificationServices() {
  
  const emailService = new ResendEmailService();
  const notifications = new NotificationService();

  return {
    notifications,
    events: new NotificationEventService(notifications, emailService),
  };
}

/**
 * Type helper for notification services
 */
export type NotificationServices = ReturnType<typeof createNotificationServices>;
