import { describe, expect, it } from 'vitest';
import { hashCode, matchesAnyHash, mintCode } from '../index';

const secret = 'test-guest-access-secret-1234567890123456';

describe('guest access codes', () => {
  it('mints six-digit codes, zero padded', () => {
    for (let i = 0; i < 200; i++) expect(mintCode()).toMatch(/^\d{6}$/);
  });

  it('hashes a code bound to its request and secret, never storing the plain code', () => {
    const hash = hashCode('req-1', '004821', secret);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('004821');
    expect(hashCode('req-2', '004821', secret)).not.toBe(hash);
    expect(hashCode('req-1', '004821', `${secret}-other`)).not.toBe(hash);
  });

  it('matches a presented code against any stored hash for its request', () => {
    const stored = [hashCode('req-1', '111111', secret), hashCode('req-1', '222222', secret)];
    expect(matchesAnyHash('req-1', '222222', stored, secret)).toBe(true);
    expect(matchesAnyHash('req-1', '333333', stored, secret)).toBe(false);
    expect(matchesAnyHash('req-1', '111111', [], secret)).toBe(false);
  });
});
