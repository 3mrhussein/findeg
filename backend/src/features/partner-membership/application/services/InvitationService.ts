import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import {
  getBusinessPartnerById,
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
  type BusinessPartnerRow,
  type PartnerDatabase,
  type PartnerInvitationRow,
  type PartnerTransaction,
} from '@findeg/db/queries/partners';
import { PARTNER_ROLES } from '@findeg/db/schema';
import type { PartnerResult, StaffActor } from '../interfaces/IPartnerService';
import type {
  EnqueueInvitation,
  IInvitationService,
  InvitationView,
  InviteInput,
  IssuedInvitation,
  PartnerInvitation,
  ResendError,
} from '../interfaces/IInvitationService';
import { canManagePartners, fail, ok } from './shared';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(255)),
  roles: z.array(z.enum(PARTNER_ROLES)).min(1),
});

/** Invitations may only change while the Business Partner is not suspended or closed. */
const isOpen = (partner: BusinessPartnerRow) =>
  partner.status === 'onboarding' || partner.status === 'active';

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
 * Partner Invitations for FindEg Staff. Each operation locks its Business
 * Partner row first, so changes to one partner run one at a time, and commits
 * its audit row (and delivery enqueue) in the same transaction.
 */
export class InvitationService implements IInvitationService {
  constructor(
    private readonly getDb: () => Promise<PartnerDatabase>,
    private readonly clock: () => Date,
    private readonly enqueue: EnqueueInvitation,
  ) {}

  async invite(actor: StaffActor, partnerId: number, input: InviteInput) {
    if (!canManagePartners(actor)) return fail('forbidden');
    const parsed = inviteSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');
    const { email, roles } = parsed.data;
    const uniqueRoles = [...new Set(roles)];

    const db = await this.getDb();
    return db.transaction(async (tx): Promise<PartnerResult<IssuedInvitation, InviteErr>> => {
      const partner = await lockBusinessPartnerById(tx, partnerId);
      if (!partner) return fail('not-found');
      if (!isOpen(partner)) return fail('partner-not-open');

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

  async resendInvitation(actor: StaffActor, invitationId: number) {
    if (!canManagePartners(actor)) return fail('forbidden');
    const db = await this.getDb();
    return db.transaction(async (tx): Promise<PartnerResult<IssuedInvitation, ResendError>> => {
      const locked = await this.lockPending(tx, invitationId);
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

  async revokeInvitation(actor: StaffActor, invitationId: number) {
    if (!canManagePartners(actor)) return fail('forbidden');
    const db = await this.getDb();
    return db.transaction(async (tx): Promise<PartnerResult<PartnerInvitation, ResendError>> => {
      const locked = await this.lockPending(tx, invitationId);
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

  async listPendingInvitations(actor: StaffActor, partnerId: number) {
    if (!canManagePartners(actor)) return fail('forbidden');
    const rows = await listPendingPartnerInvitations(await this.getDb(), partnerId);
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
    invitationId: number,
  ): Promise<PartnerResult<{ invitation: PartnerInvitationRow }, ResendError>> {
    const unlocked = await getPartnerInvitationById(tx, invitationId);
    if (!unlocked) return fail('not-found');
    const partner = await lockBusinessPartnerById(tx, unlocked.businessPartnerId);
    if (!partner) return fail('not-found');
    if (!isOpen(partner)) return fail('partner-not-open');

    const invitation = await getPartnerInvitationById(tx, invitationId);
    if (!invitation || invitation.status !== 'pending') return fail('invitation-not-pending');
    return ok({ invitation });
  }

  private async mintAndEnqueue(tx: PartnerTransaction, invitationId: number): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await insertPartnerInvitationToken(tx, invitationId, digestToken(token));
    await this.enqueue({ kind: 'partner-invitation', invitationId }, { token });
    return token;
  }

  private audit(
    tx: PartnerTransaction,
    actor: StaffActor,
    businessPartnerId: number,
    action: 'invitation.issued' | 'invitation.resent' | 'invitation.revoked',
    before: PartnerInvitationRow | null,
    after: PartnerInvitationRow,
  ) {
    return insertPartnerAccessHistory(tx, {
      businessPartnerId,
      invitationId: after.id,
      actorUserId: actor.userId,
      actorKind: 'staff',
      action,
      before: before && snapshot(before),
      after: snapshot(after),
    });
  }
}

type InviteErr = 'not-found' | 'partner-not-open';
