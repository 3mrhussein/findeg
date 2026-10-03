import { timingSafeEqual } from 'node:crypto';

/**
 * True when `authorization` is `Bearer <secret>`. An unset or empty secret rejects everything, so
 * a missing env var can never leave the sweeper open.
 */
export function isAuthorizedSweeper(authorization: string | null, secret: string | undefined) {
  if (!secret) return false;
  const match = /^Bearer (.+)$/.exec(authorization ?? '');
  if (!match) return false;
  const given = Buffer.from(match[1]);
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
