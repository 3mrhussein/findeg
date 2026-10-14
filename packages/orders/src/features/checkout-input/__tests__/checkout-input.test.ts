import { describe, expect, it } from 'vitest';
import { CheckoutOrderSchema, CheckoutValidateSchema, ListCheckoutLineSchema } from '../index';

const address = {
  fullName: 'Customer Name',
  phone: '01012345678',
  city: 'Cairo',
  area: 'Nasr City',
  street: 'Street',
  governorate: 'Cairo',
};

describe('checkout request schemas', () => {
  it('accepts a cart validate request and rejects an empty cart', () => {
    expect(
      CheckoutValidateSchema.safeParse({ source: 'cart', lines: [{ variantId: 1, quantity: 2 }] })
        .success,
    ).toBe(true);
    expect(CheckoutValidateSchema.safeParse({ source: 'cart', lines: [] }).success).toBe(false);
  });

  it('bounds cart line quantities to the Domain range of 1 to 999', () => {
    const line = (quantity: number) => ({ source: 'cart', lines: [{ variantId: 1, quantity }] });
    expect(CheckoutValidateSchema.safeParse(line(1)).success).toBe(true);
    expect(CheckoutValidateSchema.safeParse(line(999)).success).toBe(true);
    expect(CheckoutValidateSchema.safeParse(line(0)).success).toBe(false);
    expect(CheckoutValidateSchema.safeParse(line(1000)).success).toBe(false);
  });

  it('defers list line range checks to the service but requires a public code', () => {
    expect(
      CheckoutValidateSchema.safeParse({
        source: 'list',
        publicCode: 'LIST-1',
        lines: [{ listItemId: 1, variantId: 2, quantity: 5000 }],
      }).success,
    ).toBe(true);
    expect(
      CheckoutValidateSchema.safeParse({ source: 'list', publicCode: '', lines: [] }).success,
    ).toBe(false);
    expect(
      ListCheckoutLineSchema.safeParse({ listItemId: 1, variantId: 2, quantity: 1 }).success,
    ).toBe(true);
  });

  it('normalizes guest email and requires a confirmation and cod payment to accept an order', () => {
    const parsed = CheckoutOrderSchema.safeParse({
      source: 'cart',
      lines: [{ variantId: 1, quantity: 1 }],
      confirmation: 'digest',
      paymentMethod: 'cod',
      address,
      guestEmail: '  Guest@Example.COM ',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.guestEmail).toBe('guest@example.com');

    expect(
      CheckoutOrderSchema.safeParse({
        source: 'cart',
        lines: [{ variantId: 1, quantity: 1 }],
        confirmation: '',
        paymentMethod: 'cod',
        address,
      }).success,
    ).toBe(false);
    expect(
      CheckoutOrderSchema.safeParse({
        source: 'cart',
        lines: [{ variantId: 1, quantity: 1 }],
        confirmation: 'digest',
        paymentMethod: 'card',
        address,
      }).success,
    ).toBe(false);
  });

  it('rejects a governorate outside the Domain list', () => {
    expect(
      CheckoutValidateSchema.safeParse({
        source: 'cart',
        lines: [{ variantId: 1, quantity: 1 }],
        address: { ...address, governorate: 'Atlantis' },
      }).success,
    ).toBe(false);
  });
});
