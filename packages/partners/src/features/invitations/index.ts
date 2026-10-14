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
  type BusinessPartnerRow,
  type PartnerDatabase,
  type PartnerExecutor,
  type PartnerInvitationRow,
  type PartnerTransaction,
} from '@findeg/db/queries/partners';
import {
  isPartnerInvitationExpired,
  issuePartnerInvitation,
  partnerInvitationState,
  partnerStatusAllows,
  PARTNER_ROLES,
  resendPartnerInvitation,
  revokePartnerInvitation,
} from '@findeg/domain';
import type { PartnerResult } from '../../helpers/partner/types';
import type {
  EnqueueInvitation,
  IInvitationService,
  InvitationActor,
  InvitationDelivery,
  InvitationView,
  InviteError,
  InviteInput,
  IssuedInvitation,
  PartnerInvitation,
  ResendError,
  RevokeError,
} from '../../helpers/invitation/types';
import { partnerFailure } from '../../helpers/domain-failures/index';
import {
  canManagePartners,
  fail,
  isActivePartnerAdministrator,
  ok,
} from '../../helpers/shared/index';

/** Shape only: the domain checks the email, the roles and the partner's status. */
const inviteSchema = z.object({
  email: z.string(),
  roles: z.array(z.enum(PARTNER_ROLES)),
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
      if (!partner) return fail('not-found');
      const parsed = inviteSchema.safeParse(input);
      if (!parsed.success) return fail('invalid-input');

      const alreadyMember =
        (await getCurrentPartnerMembershipByEmail(
          tx,
          partnerId,
          parsed.data.email.trim().toLowerCase(),
        )) !== undefined;
      let issued: ReturnType<typeof issuePartnerInvitation>;
      try {
        issued = issuePartnerInvitation(
          { email: parsed.data.email, roles: parsed.data.roles },
          { partnerStatus: partner.status, now: this.clock(), alreadyMember },
        );
      } catch (error) {
        return partnerFailure(
          error,
          (code): code is 'invalid-input' | 'partner-not-open' | 'already-member' =>
            code === 'invalid-input' || code === 'partner-not-open' || code === 'already-member',
        );
      }

      const replaced = await getPendingPartnerInvitationByEmail(tx, partnerId, issued.email);
      if (replaced) {
        const revoked = await setPartnerInvitationStatus(
          tx,
          replaced.id,
          revokePartnerInvitation(replaced, { partnerStatus: partner.status }).status,
        );
        await this.audit(tx, actor, partnerId, 'invitation.revoked', replaced, revoked);
      }

      const created = await insertPartnerInvitation(tx, {
        businessPartnerId: partnerId,
        email: issued.email,
        roles: issued.roles,
        invitedByUserId: actor.userId,
        expiresAt: issued.expiresAt,
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
      const { invitation, partner } = locked.data;

      let renewed: PartnerInvitationRow;
      try {
        renewed = resendPartnerInvitation(invitation, {
          partnerStatus: partner.status,
          now: this.clock(),
        });
      } catch (error) {
        return partnerFailure(
          error,
          (code): code is 'invitation-not-pending' | 'partner-not-open' =>
            code === 'invitation-not-pending' || code === 'partner-not-open',
        );
      }
      const updated = await setPartnerInvitationExpiry(tx, invitation.id, renewed.expiresAt);
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
      const { invitation, partner } = locked.data;

      let withdrawn: PartnerInvitationRow;
      try {
        withdrawn = revokePartnerInvitation(invitation, { partnerStatus: partner.status });
      } catch (error) {
        return partnerFailure(
          error,
          (code): code is 'invitation-not-pending' => code === 'invitation-not-pending',
        );
      }
      const revoked = await setPartnerInvitationStatus(tx, invitation.id, withdrawn.status);
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

  async issueDeliveryToken(invitationId: number): Promise<InvitationDelivery | null> {
    const db = await this.getDb();
    return db.transaction(async (tx) => {
      const found = await getPartnerInvitationById(tx, invitationId);
      const partner = found && (await lockBusinessPartnerById(tx, found.businessPartnerId));
      if (!partner || !partnerStatusAllows(partner.status, 'membership-change')) return null;
      const invitation = await getPartnerInvitationById(tx, invitationId);
      if (!invitation || invitation.status !== 'pending') return null;
      if (isPartnerInvitationExpired(invitation, this.clock())) return null;

      const token = await this.mint(tx, invitation.id);
      return {
        email: invitation.email,
        partner: { nameEn: partner.nameEn, nameAr: partner.nameAr },
        token,
        expiresAt: invitation.expiresAt,
      };
    });
  }

  async getInvitation(token: string): Promise<PartnerResult<InvitationView, 'not-found'>> {
    const db = await this.getDb();
    const invitation = await getPartnerInvitationByTokenDigest(db, digestToken(token));
    if (!invitation) return fail('not-found');
    const partner = await getBusinessPartnerById(db, invitation.businessPartnerId);
    if (!partner) return fail('not-found');

    return ok({
      partner: { code: partner.code, nameEn: partner.nameEn, nameAr: partner.nameAr },
      email: invitation.email,
      roles: invitation.roles,
      expiresAt: invitation.expiresAt,
      state: partnerInvitationState(invitation, this.clock()),
    });
  }

  /**
   * Locks the invitation's Business Partner, then re-reads the invitation under
   * the lock so a concurrent change to it is seen. The caller's domain rule then
   * checks the partner's status and that the invitation is pending.
   */
  private async lockPending(
    tx: PartnerTransaction,
    actor: InvitationActor,
    invitationId: number,
    partnerId?: number,
  ): Promise<
    PartnerResult<{ invitation: PartnerInvitationRow; partner: BusinessPartnerRow }, ResendError>
  > {
    const found = await getPartnerInvitationById(tx, invitationId);
    // An invitation of another partner than the caller scoped to reads as missing.
    const unlocked =
      found && (partnerId === undefined || found.businessPartnerId === partnerId)
        ? found
        : undefined;
    const partner = unlocked && (await lockBusinessPartnerById(tx, unlocked.businessPartnerId));
    const denied = await this.authorize(tx, actor, partner || undefined);
    if (denied) return fail(denied);
    if (!partner) return fail('not-found');

    const invitation = await getPartnerInvitationById(tx, invitationId);
    if (!invitation) return fail('invitation-not-pending');
    return ok({ invitation, partner });
  }

  private async mint(tx: PartnerTransaction, invitationId: number): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await insertPartnerInvitationToken(tx, invitationId, digestToken(token));
    return token;
  }

  private async mintAndEnqueue(tx: PartnerTransaction, invitationId: number): Promise<string> {
    const token = await this.mint(tx, invitationId);
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
