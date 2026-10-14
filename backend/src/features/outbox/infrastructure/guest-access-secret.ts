import env from '@findeg/env';

/** The Guest Order Access secret from configuration; throws when unset so every use fails closed. */
export function requireGuestAccessSecret(): string {
  if (!env.GUEST_ACCESS_SECRET) throw new Error('GUEST_ACCESS_SECRET is not configured');
  return env.GUEST_ACCESS_SECRET;
}
