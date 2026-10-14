import { DomainError } from '../../../common';
import { PARTNER_ADMINISTRATOR } from '../../constants';
import type { BusinessPartnerStatus, PartnerMembershipStatus, PartnerRole } from '../../types';

/**
 * The action classes a Business Partner's status limits in its own Partner Workspace (ADR-0012,
 * PA-3): reading the workspace, reading Partner Reports, and changing memberships and
 * invitations. Staff list authoring is a separate rule (ADR-0014).
 */
export const PARTNER_ACTIONS = ['read', 'reports', 'membership-change'] as const;
export type PartnerAction = (typeof PARTNER_ACTIONS)[number];

/** Which Business Partner statuses allow each action class. A closed partner keeps Reports only. */
const STATUSES_ALLOWING: Readonly<Record<PartnerAction, readonly BusinessPartnerStatus[]>> = {
  read: ['onboarding', 'active', 'suspended'],
  reports: ['onboarding', 'active', 'suspended', 'closed'],
  'membership-change': ['onboarding', 'active'],
};

/** Whether a Business Partner in `status` allows `action` (ADR-0012). */
export function partnerStatusAllows(status: BusinessPartnerStatus, action: PartnerAction): boolean {
  return STATUSES_ALLOWING[action].includes(status);
}

export type PartnerAccessErrorCode = 'PARTNER_ROLE_NOT_HELD' | 'PARTNER_STATUS_NOT_ALLOWED';

/** A Partner Workspace action the member's roles or the partner's status do not allow. */
export class PartnerAccessError extends DomainError<PartnerAccessErrorCode> {}

/**
 * The one partner access check: the member must hold one of `roles` (`'any'` accepts every
 * Partner Role), and the partner's status must allow `action`. The role is checked first.
 */
export function requirePartnerRole(
  partner: { status: BusinessPartnerStatus },
  membership: { roles: readonly PartnerRole[] },
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
): void {
  if (roles !== 'any' && !membership.roles.some((role) => roles.includes(role))) {
    throw new PartnerAccessError(
      'PARTNER_ROLE_NOT_HELD',
      `The member holds none of the roles ${roles.join(', ')}`,
    );
  }
  if (!partnerStatusAllows(partner.status, action)) {
    throw new PartnerAccessError(
      'PARTNER_STATUS_NOT_ALLOWED',
      `A ${partner.status} Business Partner does not allow ${action}`,
    );
  }
}

/** Partner Roles that exist and can be held but grant nothing yet (ADR-0014, PA-5). */
export const RESERVED_PARTNER_ROLES = [
  'list-manager',
  'collection-staff',
] as const satisfies readonly PartnerRole[];

/** The Partner Roles that read Partner Reports (PA-13). */
export const PARTNER_REPORT_ROLES = [
  PARTNER_ADMINISTRATOR,
  'report-viewer',
] as const satisfies readonly PartnerRole[];

type MembershipStanding = { roles: readonly PartnerRole[]; status: PartnerMembershipStatus };

/** Whether the membership is active and holds `partner-administrator`. */
export function isActivePartnerAdministrator(membership: MembershipStanding): boolean {
  return membership.status === 'active' && membership.roles.includes(PARTNER_ADMINISTRATOR);
}

/**
 * Whether the member manages the partner's invitations and memberships (PA-6): only an active
 * Partner Administrator. Staff permission to manage partners is decided outside the domain.
 */
export function canManagePartnerMembers(membership: MembershipStanding): boolean {
  return isActivePartnerAdministrator(membership);
}

/**
 * Whether the member reads the partner's Partner Report (PA-13): an active membership holding
 * `partner-administrator` or `report-viewer`. It holds in every partner status (ADR-0010).
 */
export function canReadPartnerReport(membership: MembershipStanding): boolean {
  return (
    membership.status === 'active' &&
    membership.roles.some((role) => (PARTNER_REPORT_ROLES as readonly PartnerRole[]).includes(role))
  );
}
