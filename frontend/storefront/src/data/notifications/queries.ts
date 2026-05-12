"use cache";

import { getSession } from '@lib/session';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Get unread notification count (cached per user).
 * 
 * TODO: Integrate with backend notification service when available.
 * Currently returns placeholder.
 */
export async function getUnreadNotificationCount() {
    cacheLife('minutes');

    const session = await getSession();
    if (!session?.userId) return 0;

    cacheTag(`notifications-${session.userId}`);

    // Placeholder: replace with actual notification service call
    // const { notifications } = createNotificationServices();
    // return await notifications.getUnreadCount(session.userId);

    return 3;
}
