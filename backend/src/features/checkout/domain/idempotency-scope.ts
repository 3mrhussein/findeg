export const MAX_IDEMPOTENCY_SCOPE_LENGTH = 255;

/**
 * Builds the Idempotency Key scope (ADR-0005):
 * - Authenticated customer: `user:<userId>`
 * - Guest customer with client session token (e.g. storefront X-Guest-Id): `guest:<guestId>`
 * - Guest fallback when the token is omitted (direct API callers / automated tests):
 *   `guest:<guestEmail>`
 */
export function buildIdempotencyScope(identity: {
  userId?: number;
  guestId?: string;
  guestEmail?: string;
}): string {
  if (identity.userId) return `user:${identity.userId}`;
  return `guest:${identity.guestId || identity.guestEmail}`;
}
