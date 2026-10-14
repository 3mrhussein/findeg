import { describe, expect, it } from 'vitest';
import {
  buildIdempotencyScope,
  computeOrderFingerprint,
  MAX_IDEMPOTENCY_SCOPE_LENGTH,
} from '../index';

const address = {
  fullName: '  Customer Name ',
  phone: ' 01012345678 ',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Street',
  building: '',
};

const base = {
  lines: [
    { variantId: 2, quantity: 1 },
    { variantId: 1, quantity: 3 },
  ],
  address,
  paymentMethod: 'cod',
  confirmation: 'digest',
};

describe('buildIdempotencyScope', () => {
  it('scopes by user, then guest token, then guest email', () => {
    expect(buildIdempotencyScope({ userId: 7, guestId: 'g', guestEmail: 'a@b.c' })).toBe('user:7');
    expect(buildIdempotencyScope({ guestId: 'token', guestEmail: 'a@b.c' })).toBe('guest:token');
    expect(buildIdempotencyScope({ guestEmail: 'a@b.c' })).toBe('guest:a@b.c');
    expect(MAX_IDEMPOTENCY_SCOPE_LENGTH).toBe(255);
  });
});

describe('computeOrderFingerprint', () => {
  it('ignores line order and surrounding whitespace in the address', () => {
    const reordered = { ...base, lines: [...base.lines].reverse() };
    expect(computeOrderFingerprint(base)).toBe(computeOrderFingerprint(reordered));
    const trimmed = {
      ...base,
      address: { ...address, fullName: 'Customer Name', phone: '01012345678' },
    };
    expect(computeOrderFingerprint(base)).toBe(computeOrderFingerprint(trimmed));
  });

  it('changes when a line quantity, the confirmation or the guest email changes', () => {
    const original = computeOrderFingerprint({ ...base, guestEmail: 'guest@example.com' });
    expect(
      computeOrderFingerprint({
        ...base,
        lines: [
          { variantId: 2, quantity: 1 },
          { variantId: 1, quantity: 4 },
        ],
        guestEmail: 'guest@example.com',
      }),
    ).not.toBe(original);
    expect(
      computeOrderFingerprint({ ...base, confirmation: 'other', guestEmail: 'guest@example.com' }),
    ).not.toBe(original);
    expect(computeOrderFingerprint({ ...base, guestEmail: 'other@example.com' })).not.toBe(
      original,
    );
  });

  it('keys list selections by list item and public code', () => {
    const list = {
      ...base,
      source: 'list' as const,
      publicCode: 'LIST-1',
      lines: [
        { listItemId: 10, variantId: 1, quantity: 1 },
        { listItemId: 9, variantId: 2, quantity: 1 },
      ],
    };
    expect(computeOrderFingerprint(list)).toBe(
      computeOrderFingerprint({ ...list, lines: [...list.lines].reverse() }),
    );
    expect(computeOrderFingerprint(list)).not.toBe(
      computeOrderFingerprint({ ...list, publicCode: 'LIST-2' }),
    );
  });
});
