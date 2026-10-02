import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import type {
  PartnerAction,
  PartnerActor,
  PartnerContext,
  PartnerRole,
} from '@findeg/backend/features/partner-membership';
import { getCachedPartnerContext } from '@data/partner/queries';

export const PARTNER_ADMINISTRATOR: PartnerRole = 'partner-administrator';

export interface PartnerAccess {
  context: PartnerContext;
  actor: PartnerActor;
}

/** The actor for service calls made on behalf of a resolved Partner Context. Services re-check it. */
export const partnerActor = (context: PartnerContext): PartnerActor => ({
  kind: 'partner',
  userId: context.membership.userId,
});

/**
 * Resolves the signed-in member's access to the Partner Workspace `code` for a Server Action,
 * reading account state and membership from the database for this request. Null means the member
 * may not do `action` here (unknown, suspended or ended member, missing role, or a Business
 * Partner status that does not allow it).
 */
export async function resolvePartnerAccess(
  code: string,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
): Promise<PartnerAccess | null> {
  const context = await getCachedPartnerContext(code);
  if (!context.success) return null;
  const allowed = createPartnerMembershipServices().memberships.requireRole(
    context.data,
    roles,
    action,
  );
  return allowed.success ? { context: allowed.data, actor: partnerActor(allowed.data) } : null;
}
