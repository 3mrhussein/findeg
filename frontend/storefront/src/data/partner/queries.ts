import 'server-only';
import type { Locale } from '@findeg/domain';
import { cache } from 'react';
import {
  createPartnerMembershipServices,
  type PartnerActor,
  type PartnerContext,
  type PartnerRole,
  type PartnerAction,
  type PartnerSession,
} from '@findeg/backend/features/partner-membership';
import { createPartnerSalesServices } from '@findeg/backend/features/partner-sales';
import { getCachedSession } from '@data/auth/queries';

/**
 * Both helpers below are deduplicated only by React for the lifetime of the
 * current server request. They never use `'use cache'` or the Next.js data
 * cache: partner access depends on the user and must be re-read every request,
 * so a role or status change applies on the member's next request.
 */
async function getPartnerSession(): Promise<PartnerSession | null> {
  const session = await getCachedSession();
  return session
    ? {
        userId: session.userId,
        user: { email: session.user.email },
        tokenVersion: session.tokenVersion,
      }
    : null;
}

export const getCachedPartnerContext = cache(async (code: string) =>
  createPartnerMembershipServices().memberships.resolvePartnerContext(
    await getPartnerSession(),
    code,
  ),
);

/** The signed-in user's active memberships (empty for guests). */
export const getCachedActivePartnerMemberships = cache(async () =>
  createPartnerMembershipServices().memberships.listActiveMemberships(await getPartnerSession()),
);

/** Read a partner invitation by token. */
export async function getInvitationByToken(token: string) {
  return createPartnerMembershipServices().invitations.getInvitation(token);
}

/** Check partner role requirements. */
export function requirePartnerRole(
  context: PartnerContext,
  roles: readonly PartnerRole[] | 'any',
  action: PartnerAction,
) {
  return createPartnerMembershipServices().memberships.requireRole(context, roles, action);
}

/** List pending invitations for a partner. Propagates failures to error boundary. */
export async function getPendingInvitations(actor: PartnerActor, partnerId: number) {
  const result = await createPartnerMembershipServices().invitations.listPendingInvitations(
    actor,
    partnerId,
  );
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

/** List members for a partner. Propagates failures to error boundary. */
export async function getPartnerMembers(actor: PartnerActor, partnerId: number) {
  const result = await createPartnerMembershipServices().memberships.listMembers(actor, partnerId);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

/** Get sales report for a partner. Propagates failures to error boundary. */
export async function getPartnerReport(
  actor: { userId: number },
  partnerId: number,
  options: { month?: string; locale: Locale },
) {
  const reports = createPartnerSalesServices().partnerReports;
  const read = (selected?: string) =>
    reports.getPartnerReport(actor, partnerId, {
      month: selected,
      locale: options.locale,
    });
  let result = await read(options.month);
  if (!result.success && result.error === 'invalid-input' && options.month !== undefined) {
    result = await read();
  }
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
