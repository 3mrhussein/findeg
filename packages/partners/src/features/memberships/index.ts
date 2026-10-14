import { createHash } from 'node:crypto';
import { z } from 'zod';
import {
  countOtherActivePartnerAdministrators,
  getBusinessPartnerByCode,
  getCurrentPartnerMembership,
  getPartnerInvitationByTokenDigest,
  getPartnerMembershipById,
  getPartnerUserById,
  insertPartnerAccessHistory,
  insertPartnerMembership,
  listActivePartnerMembershipsForUser,
  listCurrentPartnerMembers,
  lockBusinessPartnerById,
  setPartnerInvitationStatus,
  updatePartnerMembership,
  verifyUserEmailIfUnset,
  type PartnerDatabase,
  type PartnerExecutor,
  type PartnerMembershipRow,
  type PartnerTransaction,
} from '@findeg/db/queries/partners';
import type { BusinessPartnerRow } from '@findeg/db/queries/partners';
import {
  acceptPartnerInvitation,
  changePartnerMembership,
  leavePartnerMembership,
  PARTNER_MEMBERSHIP_STATUSES,
  PARTNER_ROLES,
  type PartnerMembershipStatus,
  type PartnerRole,
} from '@findeg/domain';
import type {
  AcceptInvitationError,
  IMembershipService,
  LeaveError,
  PartnerAction,
  PartnerContext,
  PartnerContextError,
  PartnerMember,
  PartnerMembership,
  PartnerSession,
  UpdateMembershipError,
  UpdateMembershipInput,
} from '../../helpers/membership/types';
import type { PartnerActor, PartnerResult, StaffActor } from '../../helpers/partner/types';
import { partnerFailure } from '../../helpers/domain-failures/index';
import { requirePartnerRole } from '../../helpers/partner-role/index';
import {
  canManagePartners,
  fail,
  isActivePartnerAdministrator,
  ok,
} from '../../helpers/shared/index';

/** Shape only: the domain rejects an empty role list and reports unknown roles. */
const updateSchema = z.object({
  roles: z.array(z.enum(PARTNER_ROLES)).optional(),
  status: z.enum(PARTNER_MEMBERSHIP_STATUSES).optional(),
});

const digestToken = (token: string) => createHash('sha256').update(token).digest('hex');
const normalizeEmail = (email: string) => email.trim().toLowerCase();

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

type MembershipAuditAction =
  | 'membership.roles_changed'
  | 'membership.suspended'
  | 'membership.reactivated'
  | 'membership.ended'
  | 'membership.left';

type MembershipPatch = { roles?: PartnerRole[]; status?: PartnerMembershipRow['status'] };

type MembershipStanding = { roles: readonly PartnerRole[]; status: PartnerMembershipStatus };

const sameRoles = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((role) => b.includes(role));

/** The fields that differ between the membership as stored and as the domain changed it. */
function toPatch(current: PartnerMembershipRow, next: MembershipStanding): MembershipPatch {
  return {
    roles: sameRoles(next.roles, current.roles) ? undefined : [...next.roles],
    status: next.status !== current.status ? next.status : undefined,
  };
}

function updateAuditActions(
  current: PartnerMembershipRow,
  patch: MembershipPatch,
): MembershipAuditAction[] {
  const actions: MembershipAuditAction[] = [];
  if (patch.roles) actions.push('membership.roles_changed');
  if (patch.status === 'ended') actions.push('membership.ended');
  else if (patch.status === 'suspended') actions.push('membership.suspended');
  else if (patch.status === 'active' && current.status === 'suspended') {
    actions.push('membership.reactivated');
  }
  return actions;
}

const snapshot = (row: PartnerMembershipRow) => ({
  userId: row.userId,
  roles: row.roles,
  status: row.status,
  authorizationVersion: row.authorizationVersion,
});

/** Invitation acceptance, membership changes and request-time Partner Workspace access resolution. */
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

    return db.transaction(async (tx) => {
      const beforeLock = await getPartnerInvitationByTokenDigest(tx, digest);
      if (!beforeLock) return fail('not-found');

      const partner = await lockBusinessPartnerById(tx, beforeLock.businessPartnerId);
      if (!partner) return fail('not-found');

      // Re-read after taking the shared per-partner lock. This makes accept,
      // revoke and duplicate accepts serialize to one consistent outcome.
      const invitation = await getPartnerInvitationByTokenDigest(tx, digest);
      if (!invitation) return fail('invitation-not-pending');
      const user = await getPartnerUserById(tx, session.userId);
      if (!user?.isActive) return fail('not-authenticated');

      const existing = await getCurrentPartnerMembership(tx, partner.id, session.userId);
      let accepted: ReturnType<typeof acceptPartnerInvitation>;
      try {
        accepted = acceptPartnerInvitation(invitation, {
          email: session.user.email,
          partnerStatus: partner.status,
          now: this.clock(),
          alreadyMember: existing !== undefined,
        });
      } catch (error) {
        return partnerFailure(
          error,
          (
            code,
          ): code is
            | 'invitation-not-pending'
            | 'invitation-expired'
            | 'email-mismatch'
            | 'already-member'
            | 'partner-not-open' =>
            code === 'invitation-not-pending' ||
            code === 'invitation-expired' ||
            code === 'email-mismatch' ||
            code === 'already-member' ||
            code === 'partner-not-open',
        );
      }
      // The stored account email must also be the invited one, not only the session's.
      if (normalizeEmail(user.email) !== invitation.email) return fail('email-mismatch');

      const membership = await insertPartnerMembership(tx, {
        businessPartnerId: partner.id,
        userId: session.userId,
        invitationId: invitation.id,
        roles: [...accepted.membership.roles],
      });
      await setPartnerInvitationStatus(tx, invitation.id, accepted.invitation.status);
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
        after: snapshot(membership),
      });

      return ok(toContext(partner, membership));
    });
  }

  async updateMembership(
    actor: PartnerActor | StaffActor,
    membershipId: number,
    input: UpdateMembershipInput,
    expectedVersion: number,
  ): Promise<PartnerResult<PartnerMembership, UpdateMembershipError>> {
    if (!updateSchema.safeParse(input).success) return fail('invalid-input');
    const db = await this.getDb();
    return db.transaction(async (tx) => {
      const locked = await this.lockMembership(tx, membershipId);
      if (!locked) return fail('forbidden');
      const { partner, current } = locked;
      if (!(await this.mayManageMembers(tx, actor, partner.id))) return fail('forbidden');

      const others = await countOtherActivePartnerAdministrators(tx, partner.id, current.id);
      let change: ReturnType<typeof changePartnerMembership<PartnerMembershipRow>>;
      try {
        change = changePartnerMembership(current, input, {
          partnerStatus: partner.status,
          otherActivePartnerAdministrators: others,
        });
      } catch (error) {
        return partnerFailure(
          error,
          (code): code is 'membership-ended' | 'last-administrator' | 'invalid-input' =>
            code === 'membership-ended' ||
            code === 'last-administrator' ||
            code === 'invalid-input',
        );
      }
      if (expectedVersion !== current.authorizationVersion) return fail('stale-membership');

      if (!change.changed) return ok(toMembership(current));
      return this.commitChange(
        tx,
        actor,
        partner,
        current,
        change.membership,
        updateAuditActions(current, toPatch(current, change.membership)),
      );
    });
  }

  async leave(
    actor: PartnerActor,
    membershipId: number,
  ): Promise<PartnerResult<PartnerMembership, LeaveError>> {
    const db = await this.getDb();
    return db.transaction(async (tx) => {
      const locked = await this.lockMembership(tx, membershipId);
      if (!locked || locked.current.userId !== actor.userId) return fail('forbidden');
      const { partner, current } = locked;

      const others = await countOtherActivePartnerAdministrators(tx, partner.id, current.id);
      let left: PartnerMembershipRow;
      try {
        left = leavePartnerMembership(current, {
          partnerStatus: partner.status,
          otherActivePartnerAdministrators: others,
        });
      } catch (error) {
        return partnerFailure(
          error,
          (code): code is 'membership-ended' | 'last-administrator' =>
            code === 'membership-ended' || code === 'last-administrator',
        );
      }
      return this.commitChange(tx, actor, partner, current, left, ['membership.left']);
    });
  }

  async listMembers(
    actor: PartnerActor | StaffActor,
    partnerId: number,
  ): Promise<PartnerResult<PartnerMember[], 'forbidden'>> {
    const db = await this.getDb();
    if (!(await this.mayManageMembers(db, actor, partnerId))) return fail('forbidden');
    const rows = await listCurrentPartnerMembers(db, partnerId);
    return ok(
      rows.map((row) => ({
        ...toMembership(row),
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
      })),
    );
  }

  /** Staff need `partners.manage`; Partner actors must be an active Partner Administrator of the partner. */
  private async mayManageMembers(
    executor: PartnerExecutor,
    actor: PartnerActor | StaffActor,
    partnerId: number,
  ): Promise<boolean> {
    return actor.kind === 'staff'
      ? canManagePartners(actor)
      : isActivePartnerAdministrator(executor, partnerId, actor.userId);
  }

  /**
   * Locks the membership's Business Partner row, then re-reads the membership,
   * so two members changing each other at once run one after the other and the
   * second sees the first's outcome. Callers authorize under this lock.
   */
  private async lockMembership(tx: PartnerTransaction, membershipId: number) {
    const unlocked = await getPartnerMembershipById(tx, membershipId);
    const partner = unlocked && (await lockBusinessPartnerById(tx, unlocked.businessPartnerId));
    const current = partner ? await getPartnerMembershipById(tx, membershipId) : undefined;
    return partner && current ? { partner, current } : null;
  }

  /**
   * Writes a membership the domain has already accepted, and one audit row per
   * action, in the same transaction.
   */
  private async commitChange(
    tx: PartnerTransaction,
    actor: PartnerActor | StaffActor,
    partner: BusinessPartnerRow,
    current: PartnerMembershipRow,
    next: MembershipStanding,
    actions: readonly MembershipAuditAction[],
  ) {
    const updated = await updatePartnerMembership(
      tx,
      current.id,
      toPatch(current, next),
      this.clock(),
    );
    for (const action of actions) {
      await insertPartnerAccessHistory(tx, {
        businessPartnerId: partner.id,
        membershipId: updated.id,
        actorUserId: actor.userId,
        actorKind: action === 'membership.left' ? 'self' : actor.kind,
        action,
        before: snapshot(current),
        after: snapshot(updated),
      });
    }
    return ok(toMembership(updated));
  }

  async resolvePartnerContext(
    session: PartnerSession | null,
    code: string,
  ): Promise<PartnerResult<PartnerContext, PartnerContextError>> {
    const db = await this.getDb();
    const userId = await this.activeSessionUserId(db, session);
    if (userId === null) return fail('not-found');
    const partner = await getBusinessPartnerByCode(db, code);
    if (!partner) return fail('not-found');
    const membership = await getCurrentPartnerMembership(db, partner.id, userId);
    if (!membership) return fail('not-found');
    switch (membership.status) {
      case 'active':
        return ok(toContext(partner, membership));
      case 'suspended':
        return fail('suspended');
      case 'ended':
        return fail('not-found');
      default: {
        // Adding a membership status must be a compile error here, not a silent not-found.
        const unhandled: never = membership.status;
        throw new Error(`Unhandled membership status: ${String(unhandled)}`);
      }
    }
  }

  requireRole(
    context: PartnerContext,
    roles: readonly PartnerRole[] | 'any',
    action: PartnerAction,
  ) {
    return requirePartnerRole(context, roles, action);
  }

  async listActiveMemberships(session: PartnerSession | null): Promise<PartnerContext[]> {
    const db = await this.getDb();
    const userId = await this.activeSessionUserId(db, session);
    if (userId === null) return [];
    const rows = await listActivePartnerMembershipsForUser(db, userId);
    return rows.map(({ partner, membership }) => toContext(partner, membership));
  }

  /**
   * The signed cookie only proves who logged in; account state is revalidated on every request.
   * Returns the user id while the session still belongs to an active account.
   */
  private async activeSessionUserId(
    db: PartnerDatabase,
    session: PartnerSession | null,
  ): Promise<number | null> {
    if (!session) return null;
    const user = await getPartnerUserById(db, session.userId);
    if (!user?.isActive) return null;
    if (session.tokenVersion !== undefined && session.tokenVersion !== user.authorizationVersion) {
      return null;
    }
    return user.id;
  }
}
