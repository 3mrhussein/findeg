import { requirePartnerRole as requireDomainPartnerRole, type PartnerRole } from '@findeg/domain';
import type {
  PartnerAction,
  PartnerContext,
  RequirePartnerRoleError,
} from '../interfaces/IMembershipService';
import type { PartnerResult } from '../interfaces/IPartnerService';
import { partnerFailure } from './domain-failures';
import { ok } from './shared';

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
    return partnerFailure(error);
  }
}
