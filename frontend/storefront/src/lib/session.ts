import type { SessionPayload } from "@backend/features/core";
import { CookieSessionProvider, type ICookieStore } from "@backend/features/core";
import { cookies } from "next/headers";

/**
 * Storefront Session Helpers
 *
 * Extracts session from Next.js cookies for customer authentication.
 * Used by Storefront Server Components and Server Actions.
 *
 * CookieSessionProvider is instantiated with Next.js cookie store injected.
 * This allows backend to remain framework-agnostic while apps handle framework integration.
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

/**
 * Extracts the current customer session from cookies.
 * Returns null if no valid session cookie exists.
 *
 * Uses injected CookieSessionProvider with Next.js cookies.
 *
 * @returns Session payload with customer ID, or null if not authenticated
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await nextCookiesToStore();
    const provider = new CookieSessionProvider(cookieStore);
    return await provider.getSession();
  } catch {
    return null;
  }
}

/**
 * Creates a new customer session with the given payload
 *
 * @param payload - Session data to store
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await nextCookiesToStore();
  const provider = new CookieSessionProvider(cookieStore);
  await provider.createSession(payload);
}

/**
 * Deletes the current customer session
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await nextCookiesToStore();
  const provider = new CookieSessionProvider(cookieStore);
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
