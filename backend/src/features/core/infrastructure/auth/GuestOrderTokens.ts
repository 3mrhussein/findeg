import { SignJWT, jwtVerify } from 'jose';
import type { GuestAccessTokens } from '@findeg/orders/types';
import { GUEST_ORDER_TOKEN_SECONDS } from '@findeg/orders';

/** Audience that separates Guest Order tokens from session tokens (ADR-0008). */
const GUEST_ORDER_AUDIENCE = 'guest-order';

/**
 * Signs and verifies the short-lived Guest Order token with HS256 (jose). The secret is read per
 * operation, so an unset secret rejects the operation instead of failing at import (fail closed).
 */
export function createGuestOrderTokens(secret: () => string): GuestAccessTokens {
  const key = () => new TextEncoder().encode(secret());
  return {
    // Async so a missing secret rejects the promise rather than throwing synchronously.
    sign: async (orderReference) =>
      new SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(orderReference)
        .setAudience(GUEST_ORDER_AUDIENCE)
        .setIssuedAt()
        .setExpirationTime(`${GUEST_ORDER_TOKEN_SECONDS}s`)
        .sign(key()),
    async verify(token) {
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, key(), {
          audience: GUEST_ORDER_AUDIENCE,
          algorithms: ['HS256'],
        });
        return payload.sub ?? null;
      } catch {
        return null;
      }
    },
  };
}
