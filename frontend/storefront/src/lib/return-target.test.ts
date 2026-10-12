import { describe, expect, it } from 'vitest';
import { safeReturnTarget } from './return-target';

describe('safeReturnTarget', () => {
  it.each(['https://outside.example', '//outside.example', '/\\outside.example', ''])(
    'tries returnTo when returnUrl is invalid: %j',
    (invalid) => {
      expect(safeReturnTarget(invalid, '/checkout')).toBe('/checkout');
    },
  );
  it('prefers a valid returnUrl and falls back when neither target is valid', () => {
    expect(safeReturnTarget('/my-account/orders', '/checkout')).toBe('/my-account/orders');
    expect(safeReturnTarget(undefined, 'https://outside.example')).toBe('/my-account');
  });
});
