import { ID } from "@/features/core/domain/types/common";
import {
  SchoolListAccessGrant,
  SchoolListAccessRequest,
  SchoolListAccessToken,
} from "@/features/core/infrastructure/persistence/schema/school-access";

export type AccessState = "public" | "code_required" | "private" | "granted" | "pending";

export interface VerifyCodeResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  lockedUntil?: Date;
}

export interface ISchoolAccessService {
  /** Gets the computed access state for a list given a user */
  getAccessState(listId: ID, userId: ID | null): Promise<AccessState>;

  /** Verifies a code and grants access if valid */
  verifyCode(listId: ID, userId: ID, code: string): Promise<VerifyCodeResult>;

  /** Requests access to a private list */
  requestAccess(
    listId: ID,
    userId: ID,
    input: { childName?: string; note?: string },
  ): Promise<SchoolListAccessRequest>;

  /** Cancels a pending access request */
  cancelRequest(requestId: ID, userId: ID): Promise<void>;

  /** Validates a sharing token */
  validateToken(token: string): Promise<SchoolListAccessToken | null>;

  /** Grants access via a validated token */
  grantAccessViaToken(listId: ID, userId: ID, tokenId: ID): Promise<SchoolListAccessGrant>;
}
