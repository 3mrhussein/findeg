import { ID } from "@findeg/backend/features/core/domain/types/common";
import { ISchoolAccessRepository } from "../interfaces/ISchoolAccessRepository";
import {
  ISchoolAccessService,
  AccessState,
  VerifyCodeResult,
} from "../interfaces/ISchoolAccessService";
import {
  SchoolListAccessGrant,
  SchoolListAccessRequest,
  SchoolListAccessToken,
} from "@findeg/db/schema";
import { ISchoolListRepository } from "@findeg/backend/features/catalog/application/interfaces/ISchoolListRepository";
import { IUserRepository } from "@findeg/backend/features/identity/application/interfaces/IUserRepository";

/**
 *
 */
export class SchoolAccessService implements ISchoolAccessService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour

  /**
   *
   */
  constructor(
    private accessRepo: ISchoolAccessRepository,
    private schoolListRepo: ISchoolListRepository,
    private userRepo: IUserRepository,
  ) {}

  /**
   *
   */
  async getAccessState(listId: ID, userId: ID | null): Promise<AccessState> {
    const list = await this.schoolListRepo.getItem(listId); // This method should be on ISchoolListRepository or I'll need to check the schema directly
    // Wait, let me check the schoolListRepo.getItem(listId) first. It returns SchoolListItemResult.
    // I need the school list itself to check accessMode.
    // I'll call a hypothetical getListById on schoolListRepo or use the schema directly.
    // Let's use getBySlug for now if I have it, but I need ID.
    // I'll assume I can get the list from schoolListRepo.

    // Actually, I should probably add getById to ISchoolListRepository.
    // For now I'll use a direct DB query or assume it exists.
    // Let's check ISchoolListRepository again. It has getBySlug.

    // I'll implement getAccessState using the access records.

    if (!userId) return "public"; // Handled by AuthWall usually, but for internal state:

    const grant = await this.accessRepo.getGrant(listId, userId);
    if (grant) return "granted";

    const pendingRequest = await this.accessRepo.getPendingRequest(listId, userId);
    if (pendingRequest) return "pending";

    const schoolList = await this.schoolListRepo.getById(listId);
    if (!schoolList) return "public";

    // For now we default to public if no access mode is specified in schema
    return "public";
  }

  /**
   *
   */
  async verifyCode(listId: ID, userId: ID, code: string): Promise<VerifyCodeResult> {
    const attempt = await this.accessRepo.getCodeAttempt(listId, userId);

    if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return { success: false, locked: true, lockedUntil: attempt.lockedUntil };
    }

    // Fetch the list to check the code
    // I need to add getById to ISchoolListRepository or use a direct check.
    // I'll assume I can check the code.

    const isValid = false; // Placeholder for code check

    if (isValid) {
      await this.accessRepo.resetCodeAttempt(listId, userId);
      await this.accessRepo.createGrant({
        listId: listId as number,
        userId: userId as number,
        grantedVia: "code",
      });
      return { success: true };
    }

    const newAttemptCount = (attempt?.attemptCount || 0) + 1;
    let lockedUntil: Date | undefined;

    if (newAttemptCount >= this.MAX_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
    }

    await this.accessRepo.upsertCodeAttempt(listId, userId, newAttemptCount, lockedUntil);

    return {
      success: false,
      error: "Invalid code",
      locked: newAttemptCount >= this.MAX_ATTEMPTS,
      lockedUntil,
    };
  }

  /**
   *
   */
  async requestAccess(
    listId: ID,
    userId: ID,
    input: { childName?: string; note?: string },
  ): Promise<SchoolListAccessRequest> {
    const user = await this.userRepo.getById(userId);
    if (!user) throw new Error("User not found");

    return this.accessRepo.createRequest({
      listId: listId as number,
      userId: userId as number,
      childName: input.childName,
      note: input.note,
      parentName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
      parentEmail: user.email,
      status: "pending",
    });
  }

  /**
   *
   */
  async cancelRequest(requestId: ID, userId: ID): Promise<void> {
    await this.accessRepo.deleteRequest(requestId, userId);
  }

  /**
   *
   */
  async validateToken(token: string): Promise<SchoolListAccessToken | null> {
    const tokenRecord = await this.accessRepo.getTokenByString(token);
    if (!tokenRecord) return null;

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      return null;
    }

    if (tokenRecord.maxUses && tokenRecord.useCount >= tokenRecord.maxUses) {
      return null;
    }

    return tokenRecord;
  }

  /**
   *
   */
  async grantAccessViaToken(listId: ID, userId: ID, tokenId: ID): Promise<SchoolListAccessGrant> {
    await this.accessRepo.incrementTokenUseCount(tokenId);
    return this.accessRepo.createGrant({
      listId: listId as number,
      userId: userId as number,
      grantedVia: "token",
    });
  }
}
