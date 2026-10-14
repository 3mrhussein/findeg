import { describe, expect, it } from 'vitest';
import { GUEST_ORDER_COOKIE, GUEST_ORDER_TOKEN_SECONDS } from '../index';

describe('guest order token policy', () => {
  it('exposes the cookie name and a thirty minute lifetime', () => {
    expect(GUEST_ORDER_COOKIE).toBe('guest_order_access');
    expect(GUEST_ORDER_TOKEN_SECONDS).toBe(1800);
  });
});
