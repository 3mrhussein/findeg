import type { SessionPayload } from "@findeg/backend/features/core";
import { CookieSessionProvider, type ICookieStore } from "@findeg/backend/features/core";
import { cookies } from "next/headers";

/**
 * Dashboard Session Helpers
 *
 * Extracts session from Next.js cookies and provides typed access to session data.
 * Used by Server Components and Server Actions to get current user context.
 *
 * CookieSessionProvider is instantiated with Next.js cookie store injected.
 * This allows backend to remain framework-agnostic while apps handle framework integration.
 *
 * @example
 * const session = await getSession();
 * if (!session?.userId) {
 *   redirect("/login");
 * }
 *
 * @example
 * // In Server Action
 * "use server";
 * export async function updateProfile(data: FormData) {
 *   const session = await getSession();
 *   if (!session?.userId) throw new Error("Not authenticated");
 *   return backend.updateProfile(session.userId, data);
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
    set(name: string, value: string, options) {
      cookieStore.set(name, value, options as any);
    },
    delete(name: string) {
      cookieStore.delete(name);
    },
  };
}

/**
 * Extracts the current session from cookies.
 * Returns null if no valid session cookie exists.
 *
 * Uses injected CookieSessionProvider with Next.js cookies.
 *
 * @returns Session payload with user ID and other auth data, or null if not authenticated
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
 * Alias for getSession to maintain compatibility with legacy callers.
 */
export const extractSession = getSession;

/**
 * Creates a new session with the given payload
 *
 * @param payload - Session data to store
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await nextCookiesToStore();
  const provider = new CookieSessionProvider(cookieStore);
  await provider.createSession(payload);
}

/**
 * Deletes the current session
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await nextCookiesToStore();
  const provider = new CookieSessionProvider(cookieStore);
  await provider.deleteSession();
}

/**
 * Asserts that a session exists and returns it.
 * Throws an error if no session is found.
 *
 * @returns Valid session payload
 * @throws Error if session is invalid or missing
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Not authenticated");
  }
  return session;
}

/**
 * Extracts user ID from the current session.
 *
 * @returns User ID if authenticated, null otherwise
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ? String(session.userId) : null;
}
