'use server';

import { getUnreadNotificationCount } from './queries';

/**
 * Get unread notification count through the cached query layer.
 */
export async function getUnreadNotificationCountAction() {
  return await getUnreadNotificationCount();
}
