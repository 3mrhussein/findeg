import { cache } from 'react';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import type { PartnerSession } from '@findeg/backend/features/partner-membership';
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
