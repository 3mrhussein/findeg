import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import type { PartnerActor, PartnerContext } from '@findeg/backend/features/partner-membership';
import { getCachedPartnerContext } from '@data/partner/queries';

export interface PartnerAccess {
  context: PartnerContext;
  actor: PartnerActor;
}

/**
 * Resolves the signed-in member's access to the Partner Workspace `code` for a Server
 * Action. Account state and membership are read from the database for this request;
 * null means "not found". The services re-check the actor under the partner lock.
 */
export async function resolvePartnerAccess(code: string): Promise<PartnerAccess | null> {
  const context = await getCachedPartnerContext(code);
  if (!context.success) return null;
  return {
    context: context.data,
    actor: { kind: 'partner', userId: context.data.membership.userId },
  };
}

/** Whether members may change now: the Business Partner is onboarding or active. */
export const canChangeMembers = (context: PartnerContext) =>
  createPartnerMembershipServices().memberships.requireRole(context, 'any', 'membership-change')
    .success;
