import { ID } from '@findeg/db';
import {
  CreateSchoolListAccessGrantInput,
  CreateSchoolListAccessRequestInput,
  SchoolListAccessGrant,
  SchoolListAccessRequest,
  SchoolListAccessToken,
  SchoolListCodeAttempt,
} from '../../domain/types/Access';

export interface ISchoolAccessRepository {
  // Grants
  getGrant(listId: ID, userId: ID): Promise<SchoolListAccessGrant | null>;
  createGrant(grant: CreateSchoolListAccessGrantInput): Promise<SchoolListAccessGrant>;
  deleteGrant(listId: ID, userId: ID): Promise<void>;

  // Requests
  getRequest(listId: ID, userId: ID): Promise<SchoolListAccessRequest | null>;
  getPendingRequest(listId: ID, userId: ID): Promise<SchoolListAccessRequest | null>;
  createRequest(request: CreateSchoolListAccessRequestInput): Promise<SchoolListAccessRequest>;
  updateRequestStatus(
    requestId: ID,
    status: SchoolListAccessRequest['status'],
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
