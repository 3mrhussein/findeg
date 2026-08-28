/**
 * Query Primitives for School List Access
 *
 * Pure database queries for school access grant/request/token/attempt operations.
 * No ORM abstraction - direct Drizzle SQL operations.
 *
 * Note: Returns raw database rows. Domain logic handled by SchoolAccessService.
 */

import { db } from '../../connection';
import {
    schoolListAccessGrants,
    schoolListAccessRequests,
    schoolListAccessTokens,
    schoolListCodeAttempts,
} from '../../schema';
import { eq, and, sql } from 'drizzle-orm';
import { type ID } from '@findeg/db/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AccessGrantRow = typeof schoolListAccessGrants.$inferSelect;
export type AccessRequestRow = typeof schoolListAccessRequests.$inferSelect;
export type AccessTokenRow = typeof schoolListAccessTokens.$inferSelect;
export type CodeAttemptRow = typeof schoolListCodeAttempts.$inferSelect;

// ─── Access Grants ───────────────────────────────────────────────────────────

/**
 * Get an access grant for a user on a school list
 */
export async function getGrant(
    listId: ID,
    userId: ID,
): Promise<AccessGrantRow | null> {
    const [grant] = await db
        .select()
        .from(schoolListAccessGrants)
        .where(
            and(
                eq(schoolListAccessGrants.listId, listId as number),
                eq(schoolListAccessGrants.userId, userId as number),
            ),
        )
        .limit(1);

    return grant || null;
}

/**
 * Create an access grant
 */
export async function createGrant(data: {
    listId: number;
    userId: number;
    grantedVia?: 'token' | 'request' | 'admin';
}): Promise<AccessGrantRow> {
    const [created] = await db
        .insert(schoolListAccessGrants)
        .values({
            listId: data.listId,
            userId: data.userId,
            grantedVia: data.grantedVia || 'admin',
            grantedAt: new Date(),
        })
        .returning();

    return created;
}

/**
 * Delete an access grant
 */
export async function deleteGrant(listId: ID, userId: ID): Promise<void> {
    await db
        .delete(schoolListAccessGrants)
        .where(
            and(
                eq(schoolListAccessGrants.listId, listId as number),
                eq(schoolListAccessGrants.userId, userId as number),
            ),
        );
}

// ─── Access Requests ─────────────────────────────────────────────────────────

/**
 * Get a pending access request
 */
export async function getPendingRequest(
    listId: ID,
    userId: ID,
): Promise<AccessRequestRow | null> {
    const [request] = await db
        .select()
        .from(schoolListAccessRequests)
        .where(
            and(
                eq(schoolListAccessRequests.listId, listId as number),
                eq(schoolListAccessRequests.userId, userId as number),
                eq(schoolListAccessRequests.status, 'pending'),
            ),
        )
        .limit(1);

    return request || null;
}

/**
 * Create an access request
 */
export async function createRequest(data: {
    listId: number;
    userId: number;
    childName?: string;
    note?: string;
    parentName?: string;
    parentEmail?: string;
}): Promise<AccessRequestRow> {
    const [created] = await db
        .insert(schoolListAccessRequests)
        .values({
            listId: data.listId,
            userId: data.userId,
            childName: data.childName || null,
            note: data.note || null,
            parentName: data.parentName || '',
            parentEmail: data.parentEmail || '',
        })
        .returning();

    return created;
}

/**
 * Delete an access request
 */
export async function deleteRequest(requestId: ID): Promise<void> {
    await db.delete(schoolListAccessRequests).where(eq(schoolListAccessRequests.id, requestId as number));
}

/**
 * Update access request status
 */
export async function updateRequestStatus(
    requestId: ID,
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy?: number,
): Promise<AccessRequestRow> {
    const [updated] = await db
        .update(schoolListAccessRequests)
        .set({
            status,
            reviewedBy,
            updatedAt: new Date(),
        })
        .where(eq(schoolListAccessRequests.id, requestId as number))
        .returning();

    return updated;
}

// ─── Access Tokens ───────────────────────────────────────────────────────────

/**
 * Get an access token by its token string
 */
export async function getTokenByString(token: string): Promise<AccessTokenRow | null> {
    const [tokenRow] = await db
        .select()
        .from(schoolListAccessTokens)
        .where(eq(schoolListAccessTokens.token, token))
        .limit(1);

    return tokenRow || null;
}

/**
 * Increment token use count
 */
export async function incrementTokenUseCount(tokenId: ID): Promise<void> {
    await db
        .update(schoolListAccessTokens)
        .set({
            useCount: sql`${schoolListAccessTokens.useCount} + 1`,
        })
        .where(eq(schoolListAccessTokens.id, tokenId as number));
}

// ─── Code Attempts ───────────────────────────────────────────────────────────

/**
 * Get code attempt record for a user on a list
 */
export async function getCodeAttempt(listId: ID, userId: ID): Promise<CodeAttemptRow | null> {
    const [attempt] = await db
        .select()
        .from(schoolListCodeAttempts)
        .where(
            and(
                eq(schoolListCodeAttempts.listId, listId as number),
                eq(schoolListCodeAttempts.userId, userId as number),
            ),
        )
        .limit(1);

    return attempt || null;
}

/**
 * Upsert code attempt (create or increment)
 */
export async function upsertCodeAttempt(listId: ID, userId: ID): Promise<CodeAttemptRow> {
    const [upserted] = await db
        .insert(schoolListCodeAttempts)
        .values({
            listId: listId as number,
            userId: userId as number,
            attemptCount: 1,
        })
        .onConflictDoUpdate({
            target: [schoolListCodeAttempts.listId, schoolListCodeAttempts.userId],
            set: {
                attemptCount: sql`${schoolListCodeAttempts.attemptCount} + 1`,
            },
        })
        .returning();

    return upserted;
}

/**
 * Reset code attempt (clear lockout)
 */
export async function resetCodeAttempt(listId: ID, userId: ID): Promise<void> {
    await db
        .delete(schoolListCodeAttempts)
        .where(
            and(
                eq(schoolListCodeAttempts.listId, listId as number),
                eq(schoolListCodeAttempts.userId, userId as number),
            ),
        );
}
