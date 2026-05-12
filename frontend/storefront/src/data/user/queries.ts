"use cache";

import { getSession } from '@lib/session';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Get current user from session (cached).
 * 
 * Note: Currently returns session data directly since user is loaded at auth time.
 * If user data needs to be fetched from backend, integrate createIdentityServices here.
 */
export async function getCurrentUser() {
    cacheLife('hours');
    cacheTag('user');

    const session = await getSession();
    if (!session?.userId) return null;

    return {
        user: session.user || null,
    };
}
