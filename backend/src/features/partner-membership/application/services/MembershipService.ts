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
  listCurrentPartnerMembers,
  lockBusinessPartnerById,
  setPartnerInvitationStatus,
  updatePartnerMembership,
  verifyUserEmailIfUnset,
  type PartnerDatabase,
  type PartnerMembershipRow,
  type PartnerTransaction,
} from '@findeg/db/queries/partners';
import type { BusinessPartnerRow } from '@findeg/db/queries/partners';
import { PARTNER_MEMBERSHIP_STATUSES, PARTNER_ROLES, type PartnerRole } from '@findeg/db/schema';
import type {
  AcceptInvitationError,
  IMembershipService,
  LeaveError,
  PartnerContext,
  PartnerMember,
  PartnerMembership,
  PartnerSession,
  UpdateMembershipError,
  UpdateMembershipInput,
} from '../interfaces/IMembershipService';
import type { PartnerActor, PartnerResult } from '../interfaces/IPartnerService';
import { fail, isActivePartnerAdministrator, ok } from './shared';

const updateSchema = z.object({
  roles: z.array(z.enum(PARTNER_ROLES)).min(1).optional(),
  status: z.enum(PARTNER_MEMBERSHIP_STATUSES).optional(),
});

const ADMINISTRATOR = 'partner-administrator';

const isActiveAdministrator = (membership: Pick<PartnerMembershipRow, 'roles' | 'status'>) =>
  membership.status === 'active' && membership.roles.includes(ADMINISTRATOR);

const snapshot = (row: PartnerMembershipRow) => ({
  userId: row.userId,
  roles: row.roles,
  status: row.status,
  authorizationVersion: row.authorizationVersion,
});

type MembershipChange =
  { kind: 'update'; input: UpdateMembershipInput; expectedVersion: number } | { kind: 'leave' };

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

type MembershipAuditAction =
  | 'membership.roles_changed'
  | 'membership.suspended'
  | 'membership.reactivated'
  | 'membership.ended'
  | 'membership.left';

const sameRoles = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((role) => b.includes(role));

type MembershipPatch = { roles?: PartnerRole[]; status?: PartnerMembershipRow['status'] };

/** The fields of `input` that actually differ from the membership, deduplicated. */
function toPatch(current: PartnerMembershipRow, input: UpdateMembershipInput): MembershipPatch {
  const roles = input.roles && [...new Set(input.roles)];
  return {
    roles: roles && !sameRoles(roles, current.roles) ? roles : undefined,
    status: input.status && input.status !== current.status ? input.status : undefined,
  };
}

function auditActions(
  change: MembershipChange,
  current: PartnerMembershipRow,
  patch: MembershipPatch,
): MembershipAuditAction[] {
  if (change.kind === 'leave') return ['membership.left'];
  const actions: MembershipAuditAction[] = [];
  if (patch.roles) actions.push('membership.roles_changed');
  if (patch.status === 'ended') actions.push('membership.ended');
  else if (patch.status === 'suspended') actions.push('membership.suspended');
  else if (patch.status === 'active' && current.status === 'suspended') {
    actions.push('membership.reactivated');
  }
  return actions;
}

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
      if (!user?.isActive) return fail('not-authenticated');
      if (normalizeEmail(user.email) !== invitation.email) return fail('email-mismatch');

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

  async updateMembership(
    actor: PartnerActor,
    membershipId: number,
    input: UpdateMembershipInput,
    expectedVersion: number,
  ): Promise<PartnerResult<PartnerMembership, UpdateMembershipError>> {
    if (!updateSchema.safeParse(input).success) return fail('invalid-input');
    return this.change(actor, membershipId, { kind: 'update', input, expectedVersion });
  }

  async leave(
    actor: PartnerActor,
    membershipId: number,
  ): Promise<PartnerResult<PartnerMembership, LeaveError>> {
    // A leave carries no input or version, so `change` cannot return those two errors for it.
    return (await this.change(actor, membershipId, { kind: 'leave' })) as PartnerResult<
      PartnerMembership,
      LeaveError
    >;
  }

  async listMembers(
    actor: PartnerActor,
    partnerId: number,
  ): Promise<PartnerResult<PartnerMember[], 'forbidden'>> {
    const db = await this.getDb();
    if (!(await isActivePartnerAdministrator(db, partnerId, actor.userId)))
      return fail('forbidden');
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

  /**
   * The one write path for role, status and leave changes. It locks the
   * Business Partner row, then re-reads the membership and authorizes the actor
   * under that lock, so two members changing each other at once run one after
   * the other and the second sees the first's outcome. Final-administrator
   * protection runs under the same lock.
   */
  private async change(
    actor: PartnerActor,
    membershipId: number,
    change: MembershipChange,
  ): Promise<PartnerResult<PartnerMembership, UpdateMembershipError>> {
    const db = await this.getDb();
    return db.transaction(async (tx) => {
      const unlocked = await getPartnerMembershipById(tx, membershipId);
      const partner = unlocked && (await lockBusinessPartnerById(tx, unlocked.businessPartnerId));
      const current = partner ? await getPartnerMembershipById(tx, membershipId) : undefined;
      if (!partner || !current) return fail('forbidden');

      const allowed =
        change.kind === 'leave'
          ? current.userId === actor.userId
          : await isActivePartnerAdministrator(tx, partner.id, actor.userId);
      if (!allowed) return fail('forbidden');
      if (!isOpen(partner)) return fail('partner-not-open');
      if (current.status === 'ended') return fail('membership-ended');

      const patch: MembershipPatch =
        change.kind === 'leave' ? { status: 'ended' } : toPatch(current, change.input);
      if (change.kind === 'update' && change.expectedVersion !== current.authorizationVersion) {
        return fail('stale-membership');
      }
      if (!patch.roles && !patch.status) return ok(toMembership(current));

      const next = { roles: patch.roles ?? current.roles, status: patch.status ?? current.status };
      if (isActiveAdministrator(current) && !isActiveAdministrator(next)) {
        const others = await countOtherActivePartnerAdministrators(tx, partner.id, current.id);
        if (others === 0) return fail('last-administrator');
      }

      const updated = await updatePartnerMembership(tx, current.id, patch, this.clock());
      for (const action of auditActions(change, current, patch)) {
        await this.audit(tx, actor, partner.id, action, current, updated, change.kind);
      }
      return ok(toMembership(updated));
    });
  }

  private audit(
    tx: PartnerTransaction,
    actor: PartnerActor,
    businessPartnerId: number,
    action: MembershipAuditAction,
    before: PartnerMembershipRow,
    after: PartnerMembershipRow,
    kind: MembershipChange['kind'],
  ) {
    return insertPartnerAccessHistory(tx, {
      businessPartnerId,
      membershipId: after.id,
      actorUserId: actor.userId,
      actorKind: kind === 'leave' ? 'self' : 'partner',
      action,
      before: snapshot(before),
      after: snapshot(after),
    });
  }

  async resolvePartnerContext(session: PartnerSession | null, code: string) {
    if (!session) return fail('not-found');
    const db = await this.getDb();
    // The signed cookie only proves who logged in; account state is revalidated on every request.
    const user = await getPartnerUserById(db, session.userId);
    if (!user?.isActive) return fail('not-found');
    if (session.tokenVersion !== undefined && session.tokenVersion !== user.authorizationVersion) {
      return fail('not-found');
    }
    const partner = await getBusinessPartnerByCode(db, code);
    if (!partner) return fail('not-found');
    const membership = await getCurrentPartnerMembership(db, partner.id, session.userId);
    if (!membership || membership.status !== 'active') return fail('not-found');
    return ok(toContext(partner, membership));
  }
}
