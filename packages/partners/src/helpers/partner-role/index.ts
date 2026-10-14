import { requirePartnerRole as requireDomainPartnerRole, type PartnerRole } from '@findeg/domain';
import type { PartnerAction, PartnerContext, RequirePartnerRoleError } from '../membership/types';
import type { PartnerResult } from '../partner/types';
import { partnerFailure } from '../domain-failures/index';
import { ok } from '../shared/index';

/**
 * The one partner access check, delegated to the domain's action table (ADR-0012). `context`
 * must come from `resolvePartnerContext` in the same request, so a status or role change applies
 * on the next request. Reached through `memberships.requireRole`. Pure: it never consults the
 * Staff permission service.
 */
export function requirePartnerRole(
  context: PartnerContext,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
): PartnerResult<PartnerContext, RequirePartnerRoleError> {
  try {
    requireDomainPartnerRole(context.partner, context.membership, roles, action);
    return ok(context);
  } catch (error) {
    return partnerFailure(
      error,
      (code): code is 'role-not-held' | 'partner-status-not-allowed' =>
        code === 'role-not-held' || code === 'partner-status-not-allowed',
    );
  }
}
