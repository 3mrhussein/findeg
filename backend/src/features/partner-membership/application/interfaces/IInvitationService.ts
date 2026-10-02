import type { PartnerTransaction } from '@findeg/db/queries/partners';
import type { PartnerInvitationStatus, PartnerRole } from '@findeg/db/schema';
import type { PartnerResult, StaffActor } from './IPartnerService';

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

export type InviteError = 'forbidden' | 'invalid-input' | 'not-found' | 'partner-not-open';
export type ResendError = 'forbidden' | 'not-found' | 'partner-not-open' | 'invitation-not-pending';
export type RevokeError = ResendError;

/**
 * Delivery seam (ADR-0008). Called on the caller's open transaction `tx`, so an
 * Outbox implementation can write its row atomically with the invitation. The
 * message holds references only; the raw token of this send attempt is passed
 * alongside and never stored. Until the Outbox exists the default
 * implementation does nothing, and Staff copy the link from the token the
 * operation returns.
 */
export interface PartnerInvitationMessage {
  kind: 'partner-invitation';
  invitationId: number;
}

export type EnqueueInvitation = (
  tx: PartnerTransaction,
  message: PartnerInvitationMessage,
  secret: { token: string },
) => Promise<void> | void;

export interface IInvitationService {
  invite(
    actor: StaffActor,
    partnerId: number,
    input: InviteInput,
  ): Promise<PartnerResult<IssuedInvitation, InviteError>>;
  resendInvitation(
    actor: StaffActor,
    invitationId: number,
  ): Promise<PartnerResult<IssuedInvitation, ResendError>>;
  revokeInvitation(
    actor: StaffActor,
    invitationId: number,
  ): Promise<PartnerResult<PartnerInvitation, RevokeError>>;
  listPendingInvitations(
    actor: StaffActor,
    partnerId: number,
  ): Promise<PartnerResult<PartnerInvitation[], 'forbidden'>>;
  getInvitation(token: string): Promise<PartnerResult<InvitationView, 'not-found'>>;
}
