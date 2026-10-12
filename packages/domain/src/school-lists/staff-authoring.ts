import type { BusinessPartnerStatus } from '../partners';
import { SupplyListError } from './supply-list-error';

/**
 * What Staff do to a Business Partner's lists that depends on the partner's status.
 * `draft` covers creating, cloning, editing a draft and editing its items; `publish` covers
 * List Replacement too. Archiving, reading and setting a List Offer never depend on the status.
 */
export const STAFF_LIST_AUTHORING_ACTIONS = ['draft', 'publish'] as const;
export type StaffListAuthoringAction = (typeof STAFF_LIST_AUTHORING_ACTIONS)[number];

/**
 * The Staff list-authoring rule (ADR-0014): which partner statuses allow each action. It is its
 * own rule, kept apart from the ADR-0012 partner action table. A suspended partner's lists can
 * still be drafted but not published; a closed partner's cannot be drafted either.
 */
export const STAFF_LIST_AUTHORING_STATUSES: Readonly<
  Record<StaffListAuthoringAction, readonly BusinessPartnerStatus[]>
> = {
  draft: ['onboarding', 'active', 'suspended'],
  publish: ['onboarding', 'active'],
};

export function staffListAuthoringAllows(
  status: BusinessPartnerStatus,
  action: StaffListAuthoringAction,
): boolean {
  return STAFF_LIST_AUTHORING_STATUSES[action].includes(status);
}

/** Throws `PARTNER_STATUS_NOT_ALLOWED` unless the partner's status allows the action. */
export function assertStaffListAuthoring(
  status: BusinessPartnerStatus,
  action: StaffListAuthoringAction,
): void {
  if (!staffListAuthoringAllows(status, action)) {
    throw new SupplyListError(
      'PARTNER_STATUS_NOT_ALLOWED',
      `Staff cannot ${action} a list while its Business Partner is ${status}`,
    );
  }
}
