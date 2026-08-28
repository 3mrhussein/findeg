/**
 * Query Primitives for School List Parent Sessions
 *
 * Pure database queries for parent session operations (guest tracking, user merge).
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. Domain logic handled by ParentListService.
 */

import { db } from '../../connection';
import { schoolListParentSessions } from '../../schema';
import { eq, and, or, sql } from 'drizzle-orm';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionRow = typeof schoolListParentSessions.$inferSelect;

export interface UpsertSessionInput {
    listId: number;
    userId?: number;
    sessionToken?: string;
    itemSelections?: Record<string, any>;
    optionalInclusions?: number[];
    optionalExclusions?: number[];
}

// ─── Session Retrieval ──────────────────────────────────────────────────────

/**
 * Get session by list ID and either user ID or session token
 */
export async function getSession(
    listId: number,
    userId?: number,
    sessionToken?: string,
): Promise<SessionRow | null> {
    const conditions = [];

    if (userId) {
        conditions.push(eq(schoolListParentSessions.userId, userId));
    }

    if (sessionToken) {
        conditions.push(eq(schoolListParentSessions.sessionToken, sessionToken));
    }

    if (conditions.length === 0) return null;

    const results = await db
        .select()
        .from(schoolListParentSessions)
        .where(and(eq(schoolListParentSessions.listId, listId), or(...conditions)))
        .limit(1);

    return results[0] || null;
}

// ─── Session Mutations ──────────────────────────────────────────────────────

/**
 * Create or update session (UPSERT)
 * Target: userId+listId for user sessions, listId+sessionToken for guest sessions
 */
export async function upsertSession(input: UpsertSessionInput): Promise<SessionRow> {
    const result = await db
        .insert(schoolListParentSessions)
        .values({
            listId: input.listId,
            userId: input.userId,
            sessionToken: input.sessionToken,
            itemSelections: input.itemSelections || {},
            optionalInclusions: input.optionalInclusions || [],
            optionalExclusions: input.optionalExclusions || [],
        })
        .onConflictDoUpdate({
            target: input.userId
                ? [schoolListParentSessions.listId, schoolListParentSessions.userId]
                : [schoolListParentSessions.listId, schoolListParentSessions.sessionToken],
            set: {
                itemSelections: input.itemSelections || {},
                optionalInclusions: input.optionalInclusions || [],
                optionalExclusions: input.optionalExclusions || [],
                updatedAt: new Date(),
            },
        })
        .returning();

    return result[0];
}

/**
 * Merge guest session into user session (complex transaction)
 */
export async function mergeGuestToUser(sessionToken: string, userId: number): Promise<void> {
    // 1. Find all guest sessions with this token
    const guestSessions = await db
        .select()
        .from(schoolListParentSessions)
        .where(eq(schoolListParentSessions.sessionToken, sessionToken));

    // 2. For each guest session, merge or migrate to user
    for (const guestSession of guestSessions) {
        const existingUserSession = await db
            .select()
            .from(schoolListParentSessions)
            .where(
                and(
                    eq(schoolListParentSessions.listId, guestSession.listId),
                    eq(schoolListParentSessions.userId, userId),
                ),
            )
            .limit(1);

        if (existingUserSession[0]) {
            // Merge: union selections and optionals
            const mergedSelections = {
                ...guestSession.itemSelections,
                ...existingUserSession[0].itemSelections,
            };
            const mergedInclusions = Array.from(
                new Set([
                    ...(guestSession.optionalInclusions || []),
                    ...(existingUserSession[0].optionalInclusions || []),
                ]),
            );
            const mergedExclusions = Array.from(
                new Set([
                    ...(guestSession.optionalExclusions || []),
                    ...(existingUserSession[0].optionalExclusions || []),
                ]),
            );

            await db
                .update(schoolListParentSessions)
                .set({
                    itemSelections: mergedSelections,
                    optionalInclusions: mergedInclusions,
                    optionalExclusions: mergedExclusions,
                    sessionToken: null,
                    updatedAt: new Date(),
                })
                .where(eq(schoolListParentSessions.id, existingUserSession[0].id));

            // Delete guest session
            await db
                .delete(schoolListParentSessions)
                .where(eq(schoolListParentSessions.id, guestSession.id));
        } else {
            // Migrate guest → user (just update userId and clear token)
            await db
                .update(schoolListParentSessions)
                .set({
                    userId,
                    sessionToken: null,
                    updatedAt: new Date(),
                })
                .where(eq(schoolListParentSessions.id, guestSession.id));
        }
    }
}

// ─── Order Completion Check ─────────────────────────────────────────────────

/**
 * Check if user has completed an order for this list (via cart_kits)
 */
export async function hasCompletedOrder(listId: number, userId: number): Promise<boolean> {
    const result = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS(
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN cart_kits ck ON oi.cart_kit_id = ck.id
      WHERE o.user_id = ${userId}
      AND ck.school_list_id = ${listId}
      AND o.status NOT IN ('cancelled', 'refunded')
      LIMIT 1
    ) as exists
  `);

    return result[0]?.exists ?? false;
}
