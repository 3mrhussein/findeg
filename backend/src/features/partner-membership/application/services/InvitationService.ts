import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import {
  getBusinessPartnerById,
  getCurrentPartnerMembershipByEmail,
  getPartnerInvitationById,
  getPartnerInvitationByTokenDigest,
  getPendingPartnerInvitationByEmail,
  insertPartnerAccessHistory,
  insertPartnerInvitation,
  insertPartnerInvitationToken,
  listPendingPartnerInvitations,
  lockBusinessPartnerById,
  setPartnerInvitationExpiry,
  setPartnerInvitationStatus,
  type PartnerDatabase,
  type PartnerExecutor,
  type PartnerInvitationRow,
  type PartnerTransaction,
} from '@findeg/db/queries/partners';
import { PARTNER_ROLES } from '@findeg/db/schema';
import type { PartnerResult } from '../interfaces/IPartnerService';
import type {
  EnqueueInvitation,
  IInvitationService,
  InvitationActor,
  InvitationView,
  InviteError,
  InviteInput,
  IssuedInvitation,
  PartnerInvitation,
  ResendError,
  RevokeError,
} from '../interfaces/IInvitationService';
import { canManagePartners, fail, isActivePartnerAdministrator, isOpen, ok } from './shared';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(255)),
  roles: z.array(z.enum(PARTNER_ROLES)).min(1),
});

const digestToken = (token: string) => createHash('sha256').update(token).digest('hex');

function toInvitation(row: PartnerInvitationRow): PartnerInvitation {
  return {
    id: row.id,
    businessPartnerId: row.businessPartnerId,
    email: row.email,
    roles: row.roles,
    status: row.status,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

const snapshot = (row: PartnerInvitationRow) => ({
  email: row.email,
  roles: row.roles,
  status: row.status,
  expiresAt: row.expiresAt.toISOString(),
});

/**
 * Partner Invitations for FindEg Staff and for Partner Administrators of the
 * Business Partner. Each write locks its Business Partner row first, so
 * changes to one partner run one at a time, authorizes the actor under that
 * lock, and commits its audit row (and delivery enqueue) in the same
 * transaction. `listPendingInvitations` is a read: it authorizes the actor but takes no lock, so
 * a membership changed concurrently can still see one stale list. A partner actor cannot tell a
 * missing record from one it may not touch.
 */
export class InvitationService implements IInvitationService {
  constructor(
    private readonly getDb: () => Promise<PartnerDatabase>,
    private readonly clock: () => Date,
    private readonly enqueue: EnqueueInvitation,
  ) {}

  async invite(actor: InvitationActor, partnerId: number, input: InviteInput) {
    const db = await this.getDb();
    return db.transaction(async (tx): Promise<PartnerResult<IssuedInvitation, InviteError>> => {
      const partner = await lockBusinessPartnerById(tx, partnerId);
      const denied = await this.authorize(tx, actor, partner);
      if (denied) return fail(denied);
      const parsed = inviteSchema.safeParse(input);
      if (!parsed.success) return fail('invalid-input');
      const { email, roles } = parsed.data;
      const uniqueRoles = [...new Set(roles)];
      if (!partner || !isOpen(partner)) return fail('partner-not-open');

      if (await getCurrentPartnerMembershipByEmail(tx, partnerId, email)) {
        return fail('already-member');
      }
      const replaced = await getPendingPartnerInvitationByEmail(tx, partnerId, email);
      if (replaced) {
        const revoked = await setPartnerInvitationStatus(tx, replaced.id, 'revoked');
        await this.audit(tx, actor, partnerId, 'invitation.revoked', replaced, revoked);
      }

      const created = await insertPartnerInvitation(tx, {
        businessPartnerId: partnerId,
        email,
        roles: uniqueRoles,
        invitedByUserId: actor.userId,
        expiresAt: new Date(this.clock().getTime() + INVITATION_TTL_MS),
      });
      await this.audit(tx, actor, partnerId, 'invitation.issued', null, created);
      const token = await this.mintAndEnqueue(tx, created.id);
      return ok({ invitation: toInvitation(created), token });
    });
  }

  async resendInvitation(actor: InvitationActor, invitationId: number, partnerId?: number) {
    const db = await this.getDb();
    return db.transaction(async (tx): Promise<PartnerResult<IssuedInvitation, ResendError>> => {
      const locked = await this.lockPending(tx, actor, invitationId, partnerId);
      if (!locked.success) return locked;
      const { invitation } = locked.data;

      const updated = await setPartnerInvitationExpiry(
        tx,
        invitation.id,
        new Date(this.clock().getTime() + INVITATION_TTL_MS),
      );
      await this.audit(
        tx,
        actor,
        invitation.businessPartnerId,
        'invitation.resent',
        invitation,
        updated,
      );
      const token = await this.mintAndEnqueue(tx, invitation.id);
      return ok({ invitation: toInvitation(updated), token });
    });
  }

  async revokeInvitation(actor: InvitationActor, invitationId: number, partnerId?: number) {
    const db = await this.getDb();
    return db.transaction(async (tx): Promise<PartnerResult<PartnerInvitation, RevokeError>> => {
      const locked = await this.lockPending(tx, actor, invitationId, partnerId);
      if (!locked.success) return locked;
      const { invitation } = locked.data;

      const revoked = await setPartnerInvitationStatus(tx, invitation.id, 'revoked');
      await this.audit(
        tx,
        actor,
        invitation.businessPartnerId,
        'invitation.revoked',
        invitation,
        revoked,
      );
      return ok(toInvitation(revoked));
    });
  }

  async listPendingInvitations(actor: InvitationActor, partnerId: number) {
    const db = await this.getDb();
    if (await this.authorize(db, actor, { id: partnerId })) return fail('forbidden');
    const rows = await listPendingPartnerInvitations(db, partnerId);
    return ok(rows.map(toInvitation));
  }

  async getInvitation(token: string): Promise<PartnerResult<InvitationView, 'not-found'>> {
    const db = await this.getDb();
    const invitation = await getPartnerInvitationByTokenDigest(db, digestToken(token));
    if (!invitation) return fail('not-found');
    const partner = await getBusinessPartnerById(db, invitation.businessPartnerId);
    if (!partner) return fail('not-found');

    const expired = invitation.status === 'pending' && invitation.expiresAt <= this.clock();
    return ok({
      partner: { code: partner.code, nameEn: partner.nameEn, nameAr: partner.nameAr },
      email: invitation.email,
      roles: invitation.roles,
      expiresAt: invitation.expiresAt,
      state: expired ? 'expired' : invitation.status,
    });
  }

  /**
   * Locks the invitation's Business Partner, then re-reads the invitation under
   * the lock so a concurrent change to it is seen.
   */
  private async lockPending(
    tx: PartnerTransaction,
    actor: InvitationActor,
    invitationId: number,
    partnerId?: number,
  ): Promise<PartnerResult<{ invitation: PartnerInvitationRow }, ResendError>> {
    const found = await getPartnerInvitationById(tx, invitationId);
    // An invitation of another partner than the caller scoped to reads as missing.
    const unlocked =
      found && (partnerId === undefined || found.businessPartnerId === partnerId)
        ? found
        : undefined;
    const partner = unlocked && (await lockBusinessPartnerById(tx, unlocked.businessPartnerId));
    const denied = await this.authorize(tx, actor, partner || undefined);
    if (denied) return fail(denied);
    if (!partner || !isOpen(partner)) return fail('partner-not-open');

    const invitation = await getPartnerInvitationById(tx, invitationId);
    if (!invitation || invitation.status !== 'pending') return fail('invitation-not-pending');
    return ok({ invitation });
  }

  private async mintAndEnqueue(tx: PartnerTransaction, invitationId: number): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await insertPartnerInvitationToken(tx, invitationId, digestToken(token));
    await this.enqueue(tx, { kind: 'partner-invitation', invitationId }, { token });
    return token;
  }

  /**
   * The one actor check. Writes run it under the partner lock; the list read does not. Staff
   * need `partners.manage` and learn when the partner is missing; a partner actor must be an
   * active Partner Administrator of it and otherwise only learns `forbidden`.
   */
  private async authorize(
    executor: PartnerExecutor,
    actor: InvitationActor,
    partner: { id: number } | undefined,
  ): Promise<'forbidden' | 'not-found' | null> {
    if (actor.kind === 'staff') {
      if (!canManagePartners(actor)) return 'forbidden';
      return partner ? null : 'not-found';
    }
    const allowed =
      partner && (await isActivePartnerAdministrator(executor, partner.id, actor.userId));
    return allowed ? null : 'forbidden';
  }

  private audit(
    tx: PartnerTransaction,
    actor: InvitationActor,
    businessPartnerId: number,
    action: 'invitation.issued' | 'invitation.resent' | 'invitation.revoked',
    before: PartnerInvitationRow | null,
    after: PartnerInvitationRow,
  ) {
    return insertPartnerAccessHistory(tx, {
      businessPartnerId,
      invitationId: after.id,
      actorUserId: actor.userId,
      actorKind: actor.kind,
      action,
      before: before && snapshot(before),
      after: snapshot(after),
    });
  }
}
