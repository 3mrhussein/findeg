"use server";

import { getUnreadNotificationCount } from './queries';

/**
 * Get unread notification count through the cached query layer.
 */
export async function getUnreadNotificationCountAction() {
  return await getUnreadNotificationCount();
}

/**
 * Log a client-side action on the server.
 */
export async function logAction(payload: any): Promise<void> {
  console.log('Client action logged:', payload);
}