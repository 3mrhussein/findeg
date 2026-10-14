import { describe, expect, it } from 'vitest';
import { mapOrder } from '../index';
import { storedItem, storedOrder } from '../../../__tests__/fixture';

type StoredOrderRow = Parameters<typeof mapOrder>[0];
type StoredItemRow = Parameters<typeof mapOrder>[1][number];
type StoredUserRow = NonNullable<Parameters<typeof mapOrder>[2]>;

// The fixtures carry the stored columns the mapper reads; the row types are the schema's.
const row = (overrides: Record<string, unknown> = {}) =>
  storedOrder(overrides) as unknown as StoredOrderRow;
const item = () => storedItem(9) as unknown as StoredItemRow;

describe('Order mapping', () => {
  it('maps stored money to bigint piasters and carries the items', () => {
    const order = mapOrder(row(), [item()]);
    expect(order).toMatchObject({
      id: 9,
      subtotal: 10_000n,
      shippingCost: 5_000n,
      discountTotal: 0n,
      totalAmount: 15_000n,
      customerEmail: 'guest@example.com',
    });
    expect(order.items).toEqual([
      expect.objectContaining({
        id: 1,
        unitPrice: 5_000n,
        lineTotal: 10_000n,
        quantity: 2,
        uomCode: null,
      }),
    ]);
  });

  it('names a guest by the shipping address and a signed-in customer by the account', () => {
    expect(mapOrder(row(), []).customerName).toBe('Nour Hassan');
    const account = {
      firstName: 'Omar',
      lastName: ' Ali ',
      email: 'omar@example.com',
    } as unknown as StoredUserRow;
    expect(mapOrder(row({ userId: 4 }), [], account)).toMatchObject({
      customerName: 'Omar  Ali',
      customerEmail: 'omar@example.com',
    });
  });

  it('falls back to Guest without a shipping name', () => {
    expect(mapOrder(row({ shippingAddressSnapshot: null }), []).customerName).toBe('Guest');
  });

  it('refuses an Order whose canonical money snapshot is missing', () => {
    expect(() => mapOrder(row({ totalAmount: null }), [])).toThrow(
      'Missing canonical Order money snapshot',
    );
  });
});

describe('Order item substitutes', () => {
  it('carries the substitute flag and treats an unset flag as null', () => {
    const substitute = mapOrder(row(), [item()]).items[0];
    expect(substitute.isSubstitute).toBeNull();
    const flagged = mapOrder(row(), [{ ...item(), isSubstitute: true }]).items[0];
    expect(flagged.isSubstitute).toBe(true);
  });
});
