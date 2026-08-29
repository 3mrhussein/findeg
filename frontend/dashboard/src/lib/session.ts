/**
 * Dashboard Session Management (Next.js Integration)
 *
 * Thin Next.js adapter over the shared Current Session module.
 */

import { cookies } from 'next/headers';
import { cache } from 'react';
import {
  type ActivePortal,
  type ICookieStore,
  type SessionPayload,
} from '@findeg/backend/features/core';
import { createDashboardCurrentSession } from '@lib/current-session';

async function nextCookiesToStore(): Promise<ICookieStore> {
  const cookieStore = await cookies();
  return {
    get(name) {
      const cookie = cookieStore.get(name);
      return cookie ? { value: cookie.value } : undefined;
    },
    set(name, value, options) {
      cookieStore.set(name, value, options);
    },
    delete(name) {
      cookieStore.delete(name);
    },
  };
}

async function createCurrentSessionProvider() {
  const cookieStore = await nextCookiesToStore();
  return createDashboardCurrentSession(cookieStore);
}

const getRequestSession = cache(async (): Promise<SessionPayload | null> => {
  const provider = await createCurrentSessionProvider();
  return provider.getSession();
});

/**
 * Get current session from cookies
 *
 * Extracts and verifies JWT from admin_session cookie.
 * Returns session payload if valid, null otherwise.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    return await getRequestSession();
  } catch {
    return null;
  }
}

/**
 * Alias for getSession
 */
export const extractSession = getSession;

/**
 * Establishes a Current Session from the authoritative identity.
 */
export async function establishSession(userId: number): Promise<SessionPayload | null> {
  const provider = await createCurrentSessionProvider();
  return provider.establishSession(userId);
}

/** Selects an eligible Active Portal and renews the Current Session server-side. */
export async function switchActivePortal(activePortal: ActivePortal): Promise<SessionPayload | null> {
  const provider = await createCurrentSessionProvider();
  return provider.switchActivePortal(activePortal);
}

/**
 * Clear session cookies
 *
 * Removes admin_session cookie.
 */
export async function deleteSession(): Promise<void> {
  const provider = await createCurrentSessionProvider();
  await provider.deleteSession();
}

/**
 * Require valid session or throw error
 *
 * Throws error if no valid session exists.
 * Use this in protected routes/actions.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error('Not authenticated');
  }

  return session;
}

/**
 * Get user ID from session
 *
 * Convenience method for extracting userId.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ? String(session.userId) : null;
}
