import { db } from "@backend/features/core/infrastructure/persistence/database.config";
import { eq, and, desc, sql } from "drizzle-orm";
import { ID } from "@backend/features/core/domain/types/common";
import { ISchoolAccessRepository } from "@backend/features/school/application/interfaces/ISchoolAccessRepository";
import {
  schoolListAccessGrants,
  schoolListAccessRequests,
  schoolListAccessTokens,
  schoolListCodeAttempts,
  type SchoolListAccessGrant,
  type NewSchoolListAccessGrant,
  type SchoolListAccessRequest,
  type NewSchoolListAccessRequest,
  type SchoolListAccessToken,
  type SchoolListCodeAttempt,
} from "@backend/features/core/infrastructure/persistence/schema/school-access";

/**
 *
 */
export class DrizzleSchoolAccessRepository implements ISchoolAccessRepository {
  /**
   *
   */
  async getGrant(listId: ID, userId: ID): Promise<SchoolListAccessGrant | null> {
    const results = await db
      .select()
      .from(schoolListAccessGrants)
      .where(
        and(
          eq(schoolListAccessGrants.listId, listId as number),
          eq(schoolListAccessGrants.userId, userId as number),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   *
   */
  async createGrant(grant: NewSchoolListAccessGrant): Promise<SchoolListAccessGrant> {
    const results = await db.insert(schoolListAccessGrants).values(grant).returning();
    return results[0];
  }

  /**
   *
   */
  async deleteGrant(listId: ID, userId: ID): Promise<void> {
    await db
      .delete(schoolListAccessGrants)
      .where(
        and(
          eq(schoolListAccessGrants.listId, listId as number),
          eq(schoolListAccessGrants.userId, userId as number),
        ),
      );
  }

  /**
   *
   */
  async getRequest(listId: ID, userId: ID): Promise<SchoolListAccessRequest | null> {
    const results = await db
      .select()
      .from(schoolListAccessRequests)
      .where(
        and(
          eq(schoolListAccessRequests.listId, listId as number),
          eq(schoolListAccessRequests.userId, userId as number),
        ),
      )
      .orderBy(desc(schoolListAccessRequests.createdAt))
      .limit(1);

    return results[0] || null;
  }

  /**
   *
   */
  async getPendingRequest(listId: ID, userId: ID): Promise<SchoolListAccessRequest | null> {
    const results = await db
      .select()
      .from(schoolListAccessRequests)
      .where(
        and(
          eq(schoolListAccessRequests.listId, listId as number),
          eq(schoolListAccessRequests.userId, userId as number),
          eq(schoolListAccessRequests.status, "pending"),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   *
   */
  async createRequest(request: NewSchoolListAccessRequest): Promise<SchoolListAccessRequest> {
    const results = await db.insert(schoolListAccessRequests).values(request).returning();
    return results[0];
  }

  /**
   *
   */
  async updateRequestStatus(
    requestId: ID,
    status: SchoolListAccessRequest["status"],
    reviewerId?: ID,
  ): Promise<void> {
    await db
      .update(schoolListAccessRequests)
      .set({ status, reviewedBy: reviewerId as number, updatedAt: new Date() })
      .where(eq(schoolListAccessRequests.id, requestId as number));
  }

  /**
   *
   */
  async deleteRequest(requestId: ID, userId: ID): Promise<void> {
    await db
      .delete(schoolListAccessRequests)
      .where(
        and(
          eq(schoolListAccessRequests.id, requestId as number),
          eq(schoolListAccessRequests.userId, userId as number),
        ),
      );
  }

  /**
   *
   */
  async getTokenByString(token: string): Promise<SchoolListAccessToken | null> {
    const results = await db
      .select()
      .from(schoolListAccessTokens)
      .where(eq(schoolListAccessTokens.token, token))
      .limit(1);

    return results[0] || null;
  }

  /**
   *
   */
  async incrementTokenUseCount(tokenId: ID): Promise<void> {
    await db
      .update(schoolListAccessTokens)
      .set({ useCount: sql`${schoolListAccessTokens.useCount} + 1` })
      .where(eq(schoolListAccessTokens.id, tokenId as number));
  }

  /**
   *
   */
  async getCodeAttempt(listId: ID, userId: ID): Promise<SchoolListCodeAttempt | null> {
    const results = await db
      .select()
      .from(schoolListCodeAttempts)
      .where(
        and(
          eq(schoolListCodeAttempts.listId, listId as number),
          eq(schoolListCodeAttempts.userId, userId as number),
        ),
      )
      .limit(1);

    return results[0] || null;
  }

  /**
   *
   */
  async upsertCodeAttempt(
    listId: ID,
    userId: ID,
    attemptCount: number,
    lockedUntil?: Date,
  ): Promise<void> {
    await db
      .insert(schoolListCodeAttempts)
      .values({
        listId: listId as number,
        userId: userId as number,
        attemptCount,
        lockedUntil,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [schoolListCodeAttempts.listId, schoolListCodeAttempts.userId],
        set: { attemptCount, lockedUntil, updatedAt: new Date() },
      });
  }

  /**
   *
   */
  async resetCodeAttempt(listId: ID, userId: ID): Promise<void> {
    await db
      .delete(schoolListCodeAttempts)
      .where(
        and(
          eq(schoolListCodeAttempts.listId, listId as number),
          eq(schoolListCodeAttempts.userId, userId as number),
        ),
      );
  }
}
