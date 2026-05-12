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
 * 
 * Validates payload before logging to prevent garbage data.
 */
export async function logAction(payload: any): Promise<void> {
  if (!payload || typeof payload !== 'object') {
    console.warn('Invalid log payload received:', payload);
    return;
  }
  console.log('Client action logged:', payload);
}