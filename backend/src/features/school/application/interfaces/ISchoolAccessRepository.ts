import { ID } from "@findeg/backend/features/core/domain/types/common";
import {
  SchoolListAccessGrant,
  NewSchoolListAccessGrant,
  SchoolListAccessRequest,
  NewSchoolListAccessRequest,
  SchoolListAccessToken,
  SchoolListCodeAttempt,
} from "@findeg/db/schema";

export interface ISchoolAccessRepository {
  // Grants
  getGrant(listId: ID, userId: ID): Promise<SchoolListAccessGrant | null>;
  createGrant(grant: NewSchoolListAccessGrant): Promise<SchoolListAccessGrant>;
  deleteGrant(listId: ID, userId: ID): Promise<void>;

  // Requests
  getRequest(listId: ID, userId: ID): Promise<SchoolListAccessRequest | null>;
  getPendingRequest(listId: ID, userId: ID): Promise<SchoolListAccessRequest | null>;
  createRequest(request: NewSchoolListAccessRequest): Promise<SchoolListAccessRequest>;
  updateRequestStatus(
    requestId: ID,
    status: SchoolListAccessRequest["status"],
    reviewerId?: ID,
  ): Promise<void>;
  deleteRequest(requestId: ID, userId: ID): Promise<void>;

  // Tokens
  getTokenByString(token: string): Promise<SchoolListAccessToken | null>;
  incrementTokenUseCount(tokenId: ID): Promise<void>;

  // Code Attempts
  getCodeAttempt(listId: ID, userId: ID): Promise<SchoolListCodeAttempt | null>;
  upsertCodeAttempt(
    listId: ID,
    userId: ID,
    attemptCount: number,
    lockedUntil?: Date,
  ): Promise<void>;
  resetCodeAttempt(listId: ID, userId: ID): Promise<void>;
}
