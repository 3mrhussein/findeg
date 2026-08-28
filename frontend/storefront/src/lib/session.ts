import type { SessionPayload } from '@findeg/backend/features/core';
import {
  createCurrentSessionProvider,
  type ICookieStore,
} from '@findeg/backend/features/core';
import { CurrentSessionIdentityResolver } from '@findeg/backend/features/identity';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Storefront Session Helpers
 *
 * Extracts session from Next.js cookies for customer authentication.
 * Used by Storefront Server Components and Server Actions.
 *
 * The portal supplies only request-cookie access. The shared Current Session
 * module owns signing, identity validation, renewal, and invalidation.
 *
 * @example
 * const session = await getSession();
 * if (!session?.userId) {
 *   // Unauthenticated - show login prompt
 * }
 */

/**
 * Adapter from Next.js ReadonlyRequestCookies to ICookieStore interface
 */
async function nextCookiesToStore(): Promise<ICookieStore> {
  const cookieStore = await cookies();
  return {
    get(name: string) {
      const cookie = cookieStore.get(name);
      return cookie ? { value: cookie.value } : undefined;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set(name, value, options as any);
    },
    delete(name: string) {
      cookieStore.delete(name);
    },
  };
}

async function currentSession() {
  const cookieStore = await nextCookiesToStore();
  return createCurrentSessionProvider(cookieStore, new CurrentSessionIdentityResolver());
}

// React cache is scoped to the active server request. Unlike Next's "use cache",
// it may read request cookies and never shares an identity between requests.
const getRequestSession = cache(async (): Promise<SessionPayload | null> => {
  const provider = await currentSession();
  return provider.getSession();
});

/**
 * Extracts the current customer session from cookies.
 * Returns null if no valid session cookie exists.
 *
 * Resolves the request's Current Session and invalidates malformed or inactive identities.
 *
 * @returns Session payload with customer ID, or null if not authenticated
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    return await getRequestSession();
  } catch {
    return null;
  }
}

/**
 * Establishes a Current Session from the authoritative identity. Call this only
 * from server-side authentication or profile flows; callers never supply grants.
 *
 * @param userId - Authenticated User identifier
 */
export async function establishSession(userId: number): Promise<SessionPayload | null> {
  const provider = await currentSession();
  return provider.establishSession(userId);
}

/**
 * Deletes the current customer session
 */
export async function deleteSession(): Promise<void> {
  const provider = await currentSession();
  await provider.deleteSession();
}

/**
 * Extracts customer user ID from the current session.
 *
 * @returns Customer ID if authenticated, null otherwise
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ? String(session.userId) : null;
}
