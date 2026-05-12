import { ID } from '@findeg/backend/features/core/domain/types/common';
import { accessQueries, userQueries } from '@findeg/db/queries';
import {
  ISchoolAccessService,
  AccessState,
  VerifyCodeResult,
} from '../interfaces/ISchoolAccessService';
import {
  SchoolListAccessGrant,
  SchoolListAccessRequest,
  SchoolListAccessToken,
} from '../../domain/types/Access';
import type { ISchoolListService } from '@findeg/backend/features/catalog';

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
    private schoolListService: ISchoolListService,
  ) { }

  /**
   *
   */
  async getAccessState(listId: ID, userId: ID | null): Promise<AccessState> {
    if (!userId) return 'public';

    const grant = await accessQueries.getGrant(listId, userId);
    if (grant) return 'granted';

    const pendingRequest = await accessQueries.getPendingRequest(listId, userId);
    if (pendingRequest) return 'pending';

    const schoolList = await this.schoolListService.getListById(listId);
    if (!schoolList) return 'public';

    return 'public';
  }

  /**
   *
   */
  async verifyCode(listId: ID, userId: ID, _code: string): Promise<VerifyCodeResult> {
    const attempt = await accessQueries.getCodeAttempt(listId, userId);

    if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return { success: false, locked: true, lockedUntil: attempt.lockedUntil };
    }

    const isValid = false; // Placeholder for code check

    if (isValid) {
      await accessQueries.resetCodeAttempt(listId, userId);
      await accessQueries.createGrant({
        listId: listId as number,
        userId: userId as number,
        grantedVia: 'admin',
      });
      return { success: true };
    }

    const newAttemptCount = (attempt?.attemptCount || 0) + 1;
    let lockedUntil: Date | undefined;

    if (newAttemptCount >= this.MAX_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
    }

    await accessQueries.upsertCodeAttempt(listId, userId);

    return {
      success: false,
      error: 'Invalid code',
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
    const user = await userQueries.getById(userId);
    if (!user) throw new Error('User not found');

    return accessQueries.createRequest({
      listId: listId as number,
      userId: userId as number,
      childName: input.childName,
      note: input.note,
      parentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      parentEmail: user.email,
    });
  }

  /**
   *
   */
  async cancelRequest(requestId: ID, userId: ID): Promise<void> {
    await accessQueries.deleteRequest(requestId);
  }

  /**
   *
   */
  async validateToken(token: string): Promise<SchoolListAccessToken | null> {
    const tokenRecord = await accessQueries.getTokenByString(token);
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
    await accessQueries.incrementTokenUseCount(tokenId);
    return accessQueries.createGrant({
      listId: listId as number,
      userId: userId as number,
      grantedVia: 'token',
    });
  }
}
