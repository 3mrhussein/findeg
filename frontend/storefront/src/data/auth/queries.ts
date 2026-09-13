"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { getSession } from "@lib/session";
import type { SessionPayload } from "@findeg/backend/features/core";

/**
 * Cached session query for server components
 *
 * Uses Next.js 16 Cache Components to avoid uncached data access
 * during prerendering/build phase. Critical for auth-dependent pages.
 *
 * @returns Session payload or null if not authenticated
 */
export async function getCachedSession(): Promise<SessionPayload | null> {
    cacheLife("hours");
    cacheTag("session");

    try {
        return await getSession();
    } catch (error) {
        console.error("[Auth] Failed to get cached session:", error);
        return null;
    }
}
