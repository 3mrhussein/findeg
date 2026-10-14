import { z } from 'zod';
import { DomainError } from '../../../common';
import { PARTNER_INVITATION_VALID_DAYS } from '../../constants';
import type { BusinessPartnerStatus, PartnerInvitationStatus, PartnerRole } from '../../types';
import { partnerStatusAllows } from '../partner-access';
import { partnerRoles } from '../membership';

export type PartnerInvitationErrorCode =
  | 'INVALID_INVITATION_EMAIL'
  | 'PARTNER_NOT_OPEN'
  | 'ALREADY_PARTNER_MEMBER'
  | 'INVITATION_NOT_PENDING'
  | 'INVITATION_EXPIRED'
  | 'INVITATION_EMAIL_MISMATCH';

/**
 * A Partner Invitation change that its rules refuse. An invalid role list is reported by
 * `PartnerMembershipError` (`PARTNER_ROLE_REQUIRED`, `UNKNOWN_PARTNER_ROLE`), as for memberships.
 */
export class PartnerInvitationError extends DomainError<PartnerInvitationErrorCode> {}

const VALID_FOR_MS = PARTNER_INVITATION_VALID_DAYS * 24 * 60 * 60 * 1000;

/** When an invitation sent (or resent) at `sentAt` expires: exactly 7 days later. */
export function partnerInvitationExpiresAt(sentAt: Date): Date {
  return new Date(sentAt.getTime() + VALID_FOR_MS);
}

/** Whether the invitation has expired at `now`: it has once `expiresAt ≤ now`. */
export function isPartnerInvitationExpired(invitation: { expiresAt: Date }, now: Date): boolean {
  return invitation.expiresAt.getTime() <= now.getTime();
}

/** How an invitation reads at `now`: a pending invitation past its expiry reads as `expired`. */
export function partnerInvitationState(
  invitation: { status: PartnerInvitationStatus; expiresAt: Date },
  now: Date,
): PartnerInvitationStatus | 'expired' {
  return invitation.status === 'pending' && isPartnerInvitationExpired(invitation, now)
    ? 'expired'
    : invitation.status;
}

const INVITATION_EMAIL = z.string().trim().toLowerCase().pipe(z.email().max(255));

/** The email an invitation is addressed to: trimmed, lowercased and a valid address. */
function invitationEmail(email: string): string {
  const parsed = INVITATION_EMAIL.safeParse(email);
  if (!parsed.success) {
    throw new PartnerInvitationError(
      'INVALID_INVITATION_EMAIL',
      `${JSON.stringify(email)} is not an email an invitation can be sent to`,
    );
  }
  return parsed.data;
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function assertPartnerOpen(partnerStatus: BusinessPartnerStatus): void {
  if (!partnerStatusAllows(partnerStatus, 'membership-change')) {
    throw new PartnerInvitationError(
      'PARTNER_NOT_OPEN',
      `A ${partnerStatus} Business Partner allows no invitation changes`,
    );
  }
}

function assertPending(invitation: { status: PartnerInvitationStatus }): void {
  if (invitation.status !== 'pending') {
    throw new PartnerInvitationError(
      'INVITATION_NOT_PENDING',
      `The invitation is ${invitation.status}, not pending`,
    );
  }
}

function assertNotMember(alreadyMember: boolean): void {
  if (alreadyMember) {
    throw new PartnerInvitationError(
      'ALREADY_PARTNER_MEMBER',
      'The person already has a current membership of this Business Partner',
    );
  }
}

/** A Partner Invitation as issued: addressed, with its roles, pending and expiring. */
export interface IssuedPartnerInvitation {
  email: string;
  roles: PartnerRole[];
  status: 'pending';
  expiresAt: Date;
}

/**
 * Issues a Partner Invitation (PA-9). The email is trimmed, lowercased and must be valid; the
 * roles follow the membership rule (at least one, repeats removed). The partner must allow
 * membership changes, and the email must not belong to a current member. The invitation expires
 * 7 days after `now`. Replacing an earlier pending invitation to the same email is the caller's
 * revoke of that invitation.
 */
export function issuePartnerInvitation(
  input: { email: string; roles: readonly PartnerRole[] },
  facts: { partnerStatus: BusinessPartnerStatus; now: Date; alreadyMember: boolean },
): IssuedPartnerInvitation {
  const email = invitationEmail(input.email);
  const roles = partnerRoles(input.roles);
  assertPartnerOpen(facts.partnerStatus);
  assertNotMember(facts.alreadyMember);
  return { email, roles, status: 'pending', expiresAt: partnerInvitationExpiresAt(facts.now) };
}

type InvitationStanding = { status: PartnerInvitationStatus; expiresAt: Date };

/**
 * Resends a pending invitation: its expiry is reset to 7 days after `now`, which revives an
 * expired one. The partner must allow membership changes.
 */
export function resendPartnerInvitation<Invitation extends InvitationStanding>(
  invitation: Invitation,
  facts: { partnerStatus: BusinessPartnerStatus; now: Date },
): Invitation {
  assertPartnerOpen(facts.partnerStatus);
  assertPending(invitation);
  return { ...invitation, expiresAt: partnerInvitationExpiresAt(facts.now) };
}

/** Revokes a pending invitation. The partner must allow membership changes. */
export function revokePartnerInvitation<Invitation extends InvitationStanding>(
  invitation: Invitation,
  facts: { partnerStatus: BusinessPartnerStatus },
): Invitation {
  assertPartnerOpen(facts.partnerStatus);
  assertPending(invitation);
  return { ...invitation, status: 'revoked' };
}

/** What the caller knows when the signed-in person accepts an invitation. */
export interface PartnerInvitationAcceptanceFacts {
  /** The signed-in person's email. */
  email: string;
  partnerStatus: BusinessPartnerStatus;
  now: Date;
  /** Whether the person already has a current (not ended) membership of the partner. */
  alreadyMember: boolean;
}

/**
 * Accepts an invitation (PA-9). In order: the signed-in email must match the invitation's (trimmed
 * and lowercased), the invitation must be pending and unexpired, the partner must allow
 * membership changes, and the person must not already be a current member. Returns the accepted
 * invitation and the active membership it grants, holding the invited roles.
 */
export function acceptPartnerInvitation<
  Invitation extends InvitationStanding & { email: string; roles: readonly PartnerRole[] },
>(
  invitation: Invitation,
  facts: PartnerInvitationAcceptanceFacts,
): {
  invitation: Invitation;
  membership: { roles: readonly PartnerRole[]; status: 'active' };
} {
  if (!sameEmail(facts.email, invitation.email)) {
    throw new PartnerInvitationError(
      'INVITATION_EMAIL_MISMATCH',
      'The invitation was sent to another email',
    );
  }
  assertPending(invitation);
  if (isPartnerInvitationExpired(invitation, facts.now)) {
    throw new PartnerInvitationError('INVITATION_EXPIRED', 'The invitation has expired');
  }
  assertPartnerOpen(facts.partnerStatus);
  assertNotMember(facts.alreadyMember);
  return {
    invitation: { ...invitation, status: 'accepted' },
    membership: { roles: invitation.roles, status: 'active' },
  };
}
