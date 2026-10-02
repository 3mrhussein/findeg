import { cache } from 'react';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import { getCachedSession } from '@data/auth/queries';

/** Deduplicated only by React for the lifetime of the current server request. */
export const getCachedPartnerContext = cache(async (code: string) => {
  const session = await getCachedSession();
  return createPartnerMembershipServices().memberships.resolvePartnerContext(
    session
      ? {
          userId: session.userId,
          user: { email: session.user.email },
          tokenVersion: session.tokenVersion,
        }
      : null,
    code,
  );
});
