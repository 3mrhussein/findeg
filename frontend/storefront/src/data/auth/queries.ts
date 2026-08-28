import { getSession } from "@lib/session";
import type { SessionPayload } from "@findeg/backend/features/core";

/**
 * Cached session query for server components
 *
 * Current Session resolution is request-only. `getSession` applies request-level
 * memoization while allowing Next.js request APIs such as `cookies()`.
 *
 * @returns Session payload or null if not authenticated
 */
export async function getCachedSession(): Promise<SessionPayload | null> {
    try {
        return await getSession();
    } catch (error) {
        console.error("[Auth] Failed to get cached session:", error);
        return null;
    }
}
