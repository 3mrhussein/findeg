import 'server-only';
import { cache } from 'react';
import { getCachedSession } from '@data/auth/queries';
import { createIdentityServices } from '@findeg/backend/features/identity';

/**
 * Get current user from session.
 *
 * Read outside 'use cache' scopes so the navbar and navigation render the
 * correct state per request without leaking or caching user cookies across requests.
 *
 * @returns User session data or null if not authenticated
 */
export const getCurrentUser = cache(async () => {
  try {
    const session = await getCachedSession();
    if (!session?.userId) return null;

    return {
      user: session.user || null,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
});

/**
 * Get user profile by user ID.
 */
export async function getUserProfile(userId: number | string) {
  return createIdentityServices().userService.getProfile(Number(userId));
}
