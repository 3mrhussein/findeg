import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import type {
  PartnerAction,
  PartnerContext,
  PartnerContextError,
  PartnerRole,
  RequirePartnerRoleError,
} from '@findeg/backend/features/partner-membership';

type ContextResult =
  { success: true; data: PartnerContext } | { success: false; error: PartnerContextError };

export type PartnerPageAccess =
  | { kind: 'allowed'; context: PartnerContext }
  | { kind: 'not-found' }
  | { kind: 'suspended' }
  | { kind: 'refused'; context: PartnerContext; reason: RequirePartnerRoleError };

/**
 * Turns a resolved Partner Context into the one outcome a Partner Workspace page
 * must render. Every page must run this itself: layouts do not re-render on
 * client navigation, so a layout is never the access check.
 */
export function decidePartnerPageAccess(
  context: ContextResult,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
): PartnerPageAccess {
  if (!context.success) return { kind: context.error };
  const { requireRole } = createPartnerMembershipServices().memberships;
  const access = requireRole(context.data, roles, action);
  return access.success
    ? { kind: 'allowed', context: context.data }
    : { kind: 'refused', context: context.data, reason: access.error };
}

/** Where `/partner` sends the user: straight in for exactly one membership, else the list. */
export function partnerIndexDestination(
  memberships: readonly PartnerContext[],
): { redirectTo: string } | { list: readonly PartnerContext[] } {
  return memberships.length === 1
    ? { redirectTo: `/partner/${memberships[0].partner.code}` }
    : { list: memberships };
}
