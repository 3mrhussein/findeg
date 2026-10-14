export const GUEST_ACCESS_KIND = 'guest-access';

/** Row id for a guest access code email: one per access request. */
export const guestAccessId = (requestId: string) => `${GUEST_ACCESS_KIND}:${requestId}`;
