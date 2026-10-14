import { describe, expect, expectTypeOf, it } from 'vitest';
import type { VariantId } from '@findeg/domain/types';
import { DomainError } from '@findeg/domain';
import {
  CART_QUANTITY_MAX,
  CART_QUANTITY_MIN,
  EMPTY_CART,
  addToCart,
  cart,
  removeFromCart,
  setCartQuantity,
  type CartLine,
} from '@findeg/domain';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

const pen = 1 as VariantId;
const ruler = 2 as VariantId;

describe('Cart', () => {
  it('starts empty', () => {
    expect(EMPTY_CART.lines).toEqual([]);
  });

  it('holds price-free lines of a variant and a quantity, never list lines', () => {
    expectTypeOf<keyof CartLine>().toEqualTypeOf<'variantId' | 'quantity'>();
  });

  it('merges lines of the same variant, keeping the order they were first added', () => {
    let current = addToCart(EMPTY_CART, { variantId: pen, quantity: 2 });
    current = addToCart(current, { variantId: ruler, quantity: 1 });
    current = addToCart(current, { variantId: pen, quantity: 3 });
    expect(current.lines).toEqual([
      { variantId: pen, quantity: 5 },
      { variantId: ruler, quantity: 1 },
    ]);
  });

  it('never changes the cart it was given', () => {
    const before = addToCart(EMPTY_CART, { variantId: pen, quantity: 2 });
    addToCart(before, { variantId: pen, quantity: 3 });
    setCartQuantity(before, pen, 9);
    removeFromCart(before, pen);
    expect(before.lines).toEqual([{ variantId: pen, quantity: 2 }]);
  });

  it('sets and removes a line', () => {
    const current = cart([
      { variantId: pen, quantity: 2 },
      { variantId: ruler, quantity: 1 },
    ]);
    expect(setCartQuantity(current, pen, 7).lines).toEqual([
      { variantId: pen, quantity: 7 },
      { variantId: ruler, quantity: 1 },
    ]);
    expect(removeFromCart(current, pen).lines).toEqual([{ variantId: ruler, quantity: 1 }]);
    expect(removeFromCart(current, 3 as VariantId).lines).toEqual(current.lines);
  });

  it('refuses to set the quantity of a variant that is not in the cart', () => {
    expect(codeOf(() => setCartQuantity(EMPTY_CART, pen, 1))).toBe('VARIANT_NOT_IN_CART');
  });

  it('builds a cart from stored lines, merging repeated variants', () => {
    expect(
      cart([
        { variantId: ruler, quantity: 1 },
        { variantId: pen, quantity: 2 },
        { variantId: ruler, quantity: 4 },
      ]).lines,
    ).toEqual([
      { variantId: ruler, quantity: 5 },
      { variantId: pen, quantity: 2 },
    ]);
  });

  describe('change: a line holds 1 to 999 units', () => {
    it('declares the bounds', () => {
      expect([CART_QUANTITY_MIN, CART_QUANTITY_MAX]).toEqual([1, 999]);
    });

    it.each([[0], [-1], [1000], [1.5], [Number.NaN]])('refuses to add %s units', (quantity) => {
      expect(codeOf(() => addToCart(EMPTY_CART, { variantId: pen, quantity }))).toBe(
        'INVALID_CART_QUANTITY',
      );
    });

    it('accepts 1 and 999 units', () => {
      expect(addToCart(EMPTY_CART, { variantId: pen, quantity: 1 }).lines).toHaveLength(1);
      expect(addToCart(EMPTY_CART, { variantId: pen, quantity: 999 }).lines).toHaveLength(1);
    });

    it('refuses an addition that would take a merged line past 999', () => {
      const full = addToCart(EMPTY_CART, { variantId: pen, quantity: 998 });
      expect(addToCart(full, { variantId: pen, quantity: 1 }).lines).toEqual([
        { variantId: pen, quantity: 999 },
      ]);
      expect(codeOf(() => addToCart(full, { variantId: pen, quantity: 2 }))).toBe(
        'INVALID_CART_QUANTITY',
      );
    });

    it('refuses to set 0 or 1000 units, and stored lines that merge past 999', () => {
      const current = cart([{ variantId: pen, quantity: 2 }]);
      expect(codeOf(() => setCartQuantity(current, pen, 0))).toBe('INVALID_CART_QUANTITY');
      expect(codeOf(() => setCartQuantity(current, pen, 1000))).toBe('INVALID_CART_QUANTITY');
      expect(
        codeOf(() =>
          cart([
            { variantId: pen, quantity: 500 },
            { variantId: pen, quantity: 500 },
          ]),
        ),
      ).toBe('INVALID_CART_QUANTITY');
    });
  });
});
