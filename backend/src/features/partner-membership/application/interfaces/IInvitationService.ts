import type { PartnerTransaction } from '@findeg/db/queries/partners';
import type { PartnerInvitationStatus, PartnerRole } from '@findeg/db/schema';
import type { PartnerActor, PartnerResult, StaffActor } from './IPartnerService';

export type { PartnerRole };

export interface PartnerInvitation {
  id: number;
  businessPartnerId: number;
  email: string;
  roles: PartnerRole[];
  status: PartnerInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

/** Returned by invite and resend. The raw token is only ever held by the caller. */
export interface IssuedInvitation {
  invitation: PartnerInvitation;
  token: string;
}

export interface InviteInput {
  email: string;
  roles: readonly PartnerRole[];
}

/** What the invitation page shows for a token. Read-only. */
export interface InvitationView {
  partner: { code: string; nameEn: string; nameAr: string };
  email: string;
  roles: PartnerRole[];
  expiresAt: Date;
  /** `expired` is a pending invitation past its `expiresAt`. */
  state: 'pending' | 'expired' | 'accepted' | 'revoked';
}

/** Staff (`partners.manage`) or a Partner Administrator of the Business Partner. */
export type InvitationActor = StaffActor | PartnerActor;

export type InviteError =
  'forbidden' | 'invalid-input' | 'not-found' | 'partner-not-open' | 'already-member';
export type ResendError = 'forbidden' | 'not-found' | 'partner-not-open' | 'invitation-not-pending';
export type RevokeError = ResendError;

/**
 * Delivery seam (ADR-0008). Called on the caller's open transaction `tx`, so an
 * Outbox implementation can write its row atomically with the invitation. The
 * message holds references only; the raw token the operation returns is passed
 * alongside and an implementation must not store it. Delivery mints its own
 * token per send attempt (`issueDeliveryToken`). The default implementation does
 * nothing; Staff can always copy the link from the token the operation returns.
 */
export interface PartnerInvitationMessage {
  kind: 'partner-invitation';
  invitationId: number;
}

/** What the Invitation email needs for one send attempt, with that attempt's fresh raw token. */
export interface InvitationDelivery {
  email: string;
  partner: { nameEn: string; nameAr: string };
  token: string;
  expiresAt: Date;
}

export type EnqueueInvitation = (
  tx: PartnerTransaction,
  message: PartnerInvitationMessage,
  secret: { token: string },
) => Promise<void> | void;

export interface IInvitationService {
  invite(
    actor: InvitationActor,
    partnerId: number,
    input: InviteInput,
  ): Promise<PartnerResult<IssuedInvitation, InviteError>>;
  /**
   * `partnerId`, when given, scopes the call to that Business Partner: an invitation of another
   * partner reads as missing (`forbidden` for a partner actor, `not-found` for Staff), so a caller
   * acting inside one workspace cannot touch another's invitations.
   */
  resendInvitation(
    actor: InvitationActor,
    invitationId: number,
    partnerId?: number,
  ): Promise<PartnerResult<IssuedInvitation, ResendError>>;
  revokeInvitation(
    actor: InvitationActor,
    invitationId: number,
    partnerId?: number,
  ): Promise<PartnerResult<PartnerInvitation, RevokeError>>;
  listPendingInvitations(
    actor: InvitationActor,
    partnerId: number,
  ): Promise<PartnerResult<PartnerInvitation[], 'forbidden'>>;
  /**
   * For the Outbox handler: mints a fresh token for the invitation and stores its digest beside
   * the earlier ones. Null when the invitation is no longer pending (accepted, revoked, expired)
   * or its Business Partner is no longer open; nothing is minted then.
   */
  issueDeliveryToken(invitationId: number): Promise<InvitationDelivery | null>;
  getInvitation(token: string): Promise<PartnerResult<InvitationView, 'not-found'>>;
}
