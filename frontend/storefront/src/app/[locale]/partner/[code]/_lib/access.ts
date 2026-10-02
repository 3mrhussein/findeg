import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import type {
  PartnerAction,
  PartnerActor,
  PartnerContext,
  PartnerRole,
} from '@findeg/backend/features/partner-membership';
import { getCachedPartnerContext } from '@data/partner/queries';

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
 * Resolves the signed-in member's access to the Partner Workspace `code` for a Server
 * Action. Account state and membership are read from the database for this request;
 * null means "not found". The services re-check the actor under the partner lock.
 *
 * With a `gate`, null also means the member may not do `gate.action` here (missing role, or a
 * Business Partner status that does not allow it).
 */
export async function resolvePartnerAccess(
  code: string,
  gate?: { roles: readonly PartnerRole[] | 'any'; action: PartnerAction },
): Promise<PartnerAccess | null> {
  const context = await getCachedPartnerContext(code);
  if (!context.success) return null;
  if (!gate) return { context: context.data, actor: partnerActor(context.data) };
  const allowed = createPartnerMembershipServices().memberships.requireRole(
    context.data,
    gate.roles,
    gate.action,
  );
  return allowed.success ? { context: allowed.data, actor: partnerActor(allowed.data) } : null;
}

/** Whether members may change now: the Business Partner is onboarding or active. */
export const canChangeMembers = (context: PartnerContext) =>
  createPartnerMembershipServices().memberships.requireRole(context, 'any', 'membership-change')
    .success;
