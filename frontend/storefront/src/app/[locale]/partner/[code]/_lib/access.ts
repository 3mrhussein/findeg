import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import type { PartnerActor, PartnerContext } from '@findeg/backend/features/partner-membership';
import { getSession } from '@lib/session';

export interface PartnerAccess {
  context: PartnerContext;
  actor: PartnerActor;
}

/**
 * Resolves the signed-in member's access to the Partner Workspace `code`, for Server Actions.
 * Account state and membership are read from the database on every call; null means "not found".
 */
export async function resolvePartnerAccess(code: string): Promise<PartnerAccess | null> {
  const session = await getSession();
  if (!session) return null;
  const context = await createPartnerMembershipServices().memberships.resolvePartnerContext(
    {
      userId: session.userId,
      user: { email: session.user.email },
      tokenVersion: session.tokenVersion,
    },
    code,
  );
  if (!context.success) return null;
  return { context: context.data, actor: { kind: 'partner', userId: session.userId } };
}

export const isPartnerAdministrator = (context: PartnerContext) =>
  context.membership.roles.includes('partner-administrator');

export const isPartnerOpen = (context: PartnerContext) =>
  context.partner.status === 'onboarding' || context.partner.status === 'active';
