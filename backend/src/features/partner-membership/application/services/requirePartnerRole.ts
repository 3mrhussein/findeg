import type { PartnerRole } from '@findeg/db/schema';
import type {
  PartnerAction,
  PartnerContext,
  RequirePartnerRoleError,
} from '../interfaces/IMembershipService';
import type { PartnerResult } from '../interfaces/IPartnerService';
import { fail, ok } from './shared';

type PartnerStatus = PartnerContext['partner']['status'];

/**
 * Which Business Partner statuses allow each action class (ADR-0003). `reports`
 * is the read surface that stays open after a Business Partner is closed (ADR-0010).
 */
const ALLOWED_STATUSES: Record<PartnerAction, readonly PartnerStatus[]> = {
  read: ['onboarding', 'active', 'suspended'],
  reports: ['onboarding', 'active', 'suspended', 'closed'],
  'membership-change': ['onboarding', 'active'],
  business: ['active'],
};

/**
 * The one partner access check: the member must hold one of `roles` and the
 * Business Partner's status must allow `action`. `'any'` accepts every Partner Role.
 *
 * Pure; it never consults the Staff permission service. `context` must come
 * from `resolvePartnerContext` in the same request, so a status or role change
 * applies on the next request. Reached through `memberships.requireRole`.
 */
export function requirePartnerRole(
  context: PartnerContext,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
): PartnerResult<PartnerContext, RequirePartnerRoleError> {
  if (roles !== 'any' && !context.membership.roles.some((role) => roles.includes(role))) {
    return fail('role-not-held');
  }
  if (!ALLOWED_STATUSES[action].includes(context.partner.status)) {
    return fail('partner-status-not-allowed');
  }
  return ok(context);
}
