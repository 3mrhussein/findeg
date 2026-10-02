import { createHash } from 'node:crypto';
import {
  getBusinessPartnerByCode,
  getCurrentPartnerMembership,
  getPartnerInvitationByTokenDigest,
  getPartnerUserById,
  insertPartnerAccessHistory,
  insertPartnerMembership,
  lockBusinessPartnerById,
  setPartnerInvitationStatus,
  verifyUserEmailIfUnset,
  type PartnerDatabase,
  type PartnerMembershipRow,
} from '@findeg/db/queries/partners';
import type { BusinessPartnerRow } from '@findeg/db/queries/partners';
import type {
  AcceptInvitationError,
  IMembershipService,
  PartnerContext,
  PartnerMembership,
  PartnerSession,
} from '../interfaces/IMembershipService';
import type { PartnerResult } from '../interfaces/IPartnerService';
import { fail, ok } from './shared';

const digestToken = (token: string) => createHash('sha256').update(token).digest('hex');
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const isOpen = (partner: BusinessPartnerRow) =>
  partner.status === 'onboarding' || partner.status === 'active';

function toMembership(row: PartnerMembershipRow): PartnerMembership {
  return {
    id: row.id,
    businessPartnerId: row.businessPartnerId,
    userId: row.userId,
    invitationId: row.invitationId,
    roles: row.roles,
    status: row.status,
    authorizationVersion: row.authorizationVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toContext(partner: BusinessPartnerRow, membership: PartnerMembershipRow): PartnerContext {
  return {
    partner: {
      id: partner.id,
      code: partner.code,
      nameEn: partner.nameEn,
      nameAr: partner.nameAr,
      status: partner.status,
    },
    membership: toMembership(membership),
  };
}

/** Invitation acceptance and request-time Partner Workspace access resolution. */
export class MembershipService implements IMembershipService {
  constructor(
    private readonly getDb: () => Promise<PartnerDatabase>,
    private readonly clock: () => Date,
  ) {}

  async acceptInvitation(
    token: string,
    session: PartnerSession | null,
  ): Promise<PartnerResult<PartnerContext, AcceptInvitationError>> {
    if (!session) return fail('not-authenticated');

    const db = await this.getDb();
    const digest = digestToken(token);
    const initial = await getPartnerInvitationByTokenDigest(db, digest);
    if (!initial) return fail('not-found');
    if (normalizeEmail(session.user.email) !== initial.email) return fail('email-mismatch');

    return db.transaction(async (tx) => {
      const beforeLock = await getPartnerInvitationByTokenDigest(tx, digest);
      if (!beforeLock) return fail('not-found');

      const partner = await lockBusinessPartnerById(tx, beforeLock.businessPartnerId);
      if (!partner) return fail('not-found');

      // Re-read after taking the shared per-partner lock. This makes accept,
      // revoke and duplicate accepts serialize to one consistent outcome.
      const invitation = await getPartnerInvitationByTokenDigest(tx, digest);
      if (!invitation || invitation.status !== 'pending') return fail('invitation-not-pending');
      if (invitation.expiresAt <= this.clock()) return fail('invitation-expired');
      if (normalizeEmail(session.user.email) !== invitation.email) return fail('email-mismatch');
      if (!isOpen(partner)) return fail('partner-not-open');
      const user = await getPartnerUserById(tx, session.userId);
      if (!user || normalizeEmail(user.email) !== invitation.email) return fail('email-mismatch');

      const existing = await getCurrentPartnerMembership(tx, partner.id, session.userId);
      if (existing) return fail('already-member');

      const membership = await insertPartnerMembership(tx, {
        businessPartnerId: partner.id,
        userId: session.userId,
        invitationId: invitation.id,
        roles: invitation.roles,
      });
      await setPartnerInvitationStatus(tx, invitation.id, 'accepted');
      const acceptedAt = this.clock();
      await verifyUserEmailIfUnset(tx, session.userId, acceptedAt);
      await insertPartnerAccessHistory(tx, {
        businessPartnerId: partner.id,
        membershipId: membership.id,
        invitationId: invitation.id,
        actorUserId: session.userId,
        actorKind: 'self',
        action: 'membership.accepted',
        before: null,
        after: {
          userId: membership.userId,
          roles: membership.roles,
          status: membership.status,
          authorizationVersion: membership.authorizationVersion,
        },
      });

      return ok(toContext(partner, membership));
    });
  }

  async resolvePartnerContext(session: PartnerSession | null, code: string) {
    if (!session) return fail('not-found');
    const db = await this.getDb();
    const partner = await getBusinessPartnerByCode(db, code);
    if (!partner) return fail('not-found');
    const membership = await getCurrentPartnerMembership(db, partner.id, session.userId);
    if (!membership || membership.status !== 'active') return fail('not-found');
    return ok(toContext(partner, membership));
  }
}
