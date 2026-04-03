import type { SchemaTypes } from "@findeg/backend/features/core";

export interface IParentSessionRepository {
  /**
   * Retrieves a session by list ID and user ID or session token.
   */
  getSession(
    listId: number,
    userId?: number,
    sessionToken?: string,
  ): Promise<SchemaTypes.SchoolListParentSession | null>;

  /**
   * Creates or updates a session.
   */
  upsertSession(session: SchemaTypes.NewSchoolListParentSession): Promise<SchemaTypes.SchoolListParentSession>;

  /**
   * Merges a guest session into a user session.
   */
  mergeGuestToUser(sessionToken: string, userId: number): Promise<void>;

  /**
   * Checks if an order has been completed for this list by the user.
   */
  hasCompletedOrder(listId: number, userId: number): Promise<boolean>;
}
