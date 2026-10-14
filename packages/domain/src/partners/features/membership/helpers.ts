import { DomainError } from '../../../common';
import { PARTNER_ADMINISTRATOR_MIN_ACTIVE, PARTNER_ROLES } from '../../constants';
import type { BusinessPartnerStatus, PartnerMembershipStatus, PartnerRole } from '../../types';
import { isActivePartnerAdministrator, partnerStatusAllows } from '../partner-access';

export type PartnerMembershipErrorCode =
  | 'PARTNER_ROLE_REQUIRED'
  | 'UNKNOWN_PARTNER_ROLE'
  | 'PARTNER_NOT_OPEN'
  | 'PARTNER_MEMBERSHIP_ENDED'
  | 'LAST_PARTNER_ADMINISTRATOR';

/** A Partner Membership change that its rules refuse. */
export class PartnerMembershipError extends DomainError<PartnerMembershipErrorCode> {}

/**
 * The roles a membership or invitation grants: at least one, each a Partner Role, repeats removed
 * in the order given.
 */
export function partnerRoles(roles: readonly string[]): PartnerRole[] {
  if (roles.length === 0) {
    throw new PartnerMembershipError(
      'PARTNER_ROLE_REQUIRED',
      'At least one Partner Role is needed',
    );
  }
  const unknown = roles.find((role) => !(PARTNER_ROLES as readonly string[]).includes(role));
  if (unknown !== undefined) {
    throw new PartnerMembershipError(
      'UNKNOWN_PARTNER_ROLE',
      `${JSON.stringify(unknown)} is not a Partner Role`,
    );
  }
  return [...new Set(roles as readonly PartnerRole[])];
}

/**
 * Refuses a membership change unless the partner allows membership changes (onboarding or
 * active, ADR-0012) and the membership has not ended (PA-8).
 */
function assertMembershipChangeable(
  membership: { status: PartnerMembershipStatus },
  partnerStatus: BusinessPartnerStatus,
): void {
  if (!partnerStatusAllows(partnerStatus, 'membership-change')) {
    throw new PartnerMembershipError(
      'PARTNER_NOT_OPEN',
      `A ${partnerStatus} Business Partner allows no membership changes`,
    );
  }
  if (membership.status === 'ended') {
    throw new PartnerMembershipError(
      'PARTNER_MEMBERSHIP_ENDED',
      'An ended Partner Membership never changes',
    );
  }
}

type MembershipStanding = { roles: readonly PartnerRole[]; status: PartnerMembershipStatus };

/** Refuses a change that would remove the partner's last active Partner Administrator (PA-7). */
function assertKeepsAnAdministrator(
  current: MembershipStanding,
  next: MembershipStanding,
  otherActivePartnerAdministrators: number,
): void {
  if (
    isActivePartnerAdministrator(current) &&
    !isActivePartnerAdministrator(next) &&
    otherActivePartnerAdministrators + 1 <= PARTNER_ADMINISTRATOR_MIN_ACTIVE
  ) {
    throw new PartnerMembershipError(
      'LAST_PARTNER_ADMINISTRATOR',
      'A Business Partner always keeps at least one active Partner Administrator',
    );
  }
}

/** What the caller knows about the membership's partner when changing it. */
export interface PartnerMembershipChangeFacts {
  partnerStatus: BusinessPartnerStatus;
  /** The partner's active Partner Administrators other than this membership. */
  otherActivePartnerAdministrators: number;
}

/** Omitted fields stay as they are. `status: 'ended'` removes the member for good. */
export interface PartnerMembershipChange {
  roles?: readonly PartnerRole[];
  status?: PartnerMembershipStatus;
}

export interface PartnerMembershipChangeResult<Membership> {
  membership: Membership;
  /** False when the change changes nothing: the membership given is returned as it is. */
  changed: boolean;
}

/**
 * Changes a Partner Membership's roles and/or status (ADR-0003, PA-7, PA-8). In order: the roles
 * must be valid, the partner must allow membership changes, and an ended membership never
 * changes. A change equal to the membership (the same status, or the same roles in any order) is a
 * no-op. Last, it never removes the partner's last active Partner Administrator.
 */
export function changePartnerMembership<Membership extends MembershipStanding>(
  membership: Membership,
  change: PartnerMembershipChange,
  facts: PartnerMembershipChangeFacts,
): PartnerMembershipChangeResult<Membership> {
  const roles = change.roles && partnerRoles(change.roles);
  assertMembershipChangeable(membership, facts.partnerStatus);

  // Any move is allowed from active or suspended (PARTNER_MEMBERSHIP_STATUS_TRANSITIONS).
  const newRoles = roles && !sameRoles(roles, membership.roles) ? roles : undefined;
  const newStatus = change.status !== membership.status ? change.status : undefined;
  if (!newRoles && !newStatus) return { membership, changed: false };

  const next = {
    ...membership,
    roles: newRoles ?? membership.roles,
    status: newStatus ?? membership.status,
  };
  assertKeepsAnAdministrator(membership, next, facts.otherActivePartnerAdministrators);
  return { membership: next, changed: true };
}

/**
 * The member leaves the Business Partner: the membership ends. The partner must allow membership
 * changes, the membership must not have ended, and the last active Partner Administrator cannot
 * leave.
 */
export function leavePartnerMembership<Membership extends MembershipStanding>(
  membership: Membership,
  facts: PartnerMembershipChangeFacts,
): Membership {
  assertMembershipChangeable(membership, facts.partnerStatus);
  const next = { ...membership, status: 'ended' as const };
  assertKeepsAnAdministrator(membership, next, facts.otherActivePartnerAdministrators);
  return next;
}

function sameRoles(a: readonly PartnerRole[], b: readonly PartnerRole[]): boolean {
  return a.length === b.length && a.every((role) => b.includes(role));
}
