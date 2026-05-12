'use server';

import { getSession } from '@lib/session';

/**
 * Server action to get unread notification count.
 */
export async function getUnreadNotificationCountAction() {
  const session = await getSession();
  if (!session?.userId) return 0;

  // Placeholder for real notification logic
  // In a real app, this would query a notification repository
  return 3;
}

/**
 * Log a client-side action to the server log.
 * In a production app, this would forward to Datadog/Sentry.
 * NOTE: Logging infrastructure was removed during backend refactoring.
 * Implement via your observability provider (Datadog, Sentry, etc).
 */
export async function logAction(payload: any): Promise<void> {
  // TODO: Integrate with Datadog/Sentry
  console.log('Client action logged:', payload);
}
