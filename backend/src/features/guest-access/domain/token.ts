import { SignJWT, jwtVerify } from 'jose';
import { requireGuestAccessSecret } from './codes';

export const GUEST_ORDER_COOKIE = 'guest_order_access';
export const GUEST_ORDER_TOKEN_SECONDS = 30 * 60;
const AUDIENCE = 'guest-order';

const key = () => new TextEncoder().encode(requireGuestAccessSecret());

/** Signs a short-lived token that unlocks exactly one Order, named by its reference. */
export async function signGuestOrderToken(orderReference: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(orderReference)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${GUEST_ORDER_TOKEN_SECONDS}s`)
    .sign(key());
}

/** The Order Reference the token unlocks, or null when it is missing, forged or expired. */
export async function verifyGuestOrderToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), {
      audience: AUDIENCE,
      algorithms: ['HS256'],
    });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
