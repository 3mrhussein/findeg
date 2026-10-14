import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { GUEST_ORDER_TOKEN_SECONDS } from '@findeg/orders';
import { createGuestOrderTokens } from '../GuestOrderTokens';

const secret = () => 'test-guest-access-secret-1234567890123456';

describe('guest order tokens', () => {
  it('names the Order it unlocks and round-trips for the same secret', async () => {
    const tokens = createGuestOrderTokens(secret);
    expect(await tokens.verify(await tokens.sign('FE-1001'))).toBe('FE-1001');
  });

  it('rejects a missing, forged or foreign-secret token', async () => {
    const tokens = createGuestOrderTokens(secret);
    const token = await tokens.sign('FE-1001');
    expect(await tokens.verify(undefined)).toBeNull();
    expect(await tokens.verify(`${token}x`)).toBeNull();
    const other = createGuestOrderTokens(() => 'another-secret-value-1234567890123456');
    expect(await other.verify(token)).toBeNull();
  });

  it('rejects a token that names no Order', async () => {
    const subjectless = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setAudience('guest-order')
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(secret()));
    expect(await createGuestOrderTokens(secret).verify(subjectless)).toBeNull();
  });

  it('fails closed when the secret is not configured', async () => {
    const unset = createGuestOrderTokens(() => {
      throw new Error('GUEST_ACCESS_SECRET is not configured');
    });
    expect(await unset.verify('anything')).toBeNull();
    await expect(unset.sign('FE-1001')).rejects.toThrow('not configured');
  });

  it('uses the thirty minute lifetime from Orders', () => {
    expect(GUEST_ORDER_TOKEN_SECONDS).toBe(1800);
  });
});
