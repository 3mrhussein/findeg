import { db } from '@findeg/db/connection';
import { eq, and, or, sql } from 'drizzle-orm';
import { IParentSessionRepository } from '../application/interfaces/IParentSessionRepository';
import {
  schoolListParentSessions,
  SchoolListParentSession,
  NewSchoolListParentSession,
} from '@findeg/db/schema';

/**
 *
 */
export class DrizzleParentSessionRepository implements IParentSessionRepository {
  /**
   *
   */
  constructor() {}

  /**
   *
   */
  async getSession(
    listId: number,
    userId?: number,
    sessionToken?: string,
  ): Promise<SchoolListParentSession | null> {
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

  /**
   *
   */
  async upsertSession(session: NewSchoolListParentSession): Promise<SchoolListParentSession> {
    const result = await db
      .insert(schoolListParentSessions)
      .values(session)
      .onConflictDoUpdate({
        target: session.userId
          ? [schoolListParentSessions.listId, schoolListParentSessions.userId]
          : [schoolListParentSessions.listId, schoolListParentSessions.sessionToken],
        set: {
          itemSelections: session.itemSelections,
          optionalInclusions: session.optionalInclusions,
          optionalExclusions: session.optionalExclusions,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  }

  /**
   *
   */
  async mergeGuestToUser(sessionToken: string, userId: number): Promise<void> {
    // 1. Find the guest session
    const guestSessions = await db
      .select()
      .from(schoolListParentSessions)
      .where(eq(schoolListParentSessions.sessionToken, sessionToken));

    for (const guestSession of guestSessions) {
      // 2. Check if a user session already exists for this list
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
        // 3a. Merge data (User session takes precedence for common items? or merge?)
        // Let's assume merge: union itemSelections, union optionals
        const mergedSelections = {
          ...guestSession.itemSelections,
          ...existingUserSession[0].itemSelections,
        };
        const mergedInclusions = Array.from(
          new Set([
            ...guestSession.optionalInclusions,
            ...existingUserSession[0].optionalInclusions,
          ]),
        );
        const mergedExclusions = Array.from(
          new Set([
            ...guestSession.optionalExclusions,
            ...existingUserSession[0].optionalExclusions,
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
        // 3b. Just assign userId to guest session
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

  /**
   *
   */
  async hasCompletedOrder(listId: number, userId: number): Promise<boolean> {
    // This requires checking order_items with cart_kit linking to this list
    // OR we can check if there's any order where an item's product belongs to this list
    // BUT since we added cart_kit, we should query orders -> order_items -> cart_kits

    // For now, let's just check if there's an order created by this user that contains a kit for this list
    // This is more robust.

    const result = await db.execute(sql`
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN cart_kits ck ON oi.cart_kit_id = ck.id
      WHERE o.user_id = ${userId}
      AND ck.school_list_id = ${listId}
      AND o.status NOT IN ('cancelled', 'refunded')
      LIMIT 1
    `);

    return result.length > 0;
  }
}
