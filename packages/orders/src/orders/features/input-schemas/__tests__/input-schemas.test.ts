import { describe, expect, it } from 'vitest';
import {
  OrderStatusSchema as orderStatusSchema,
  OrderStatusUpdateSchema as orderStatusUpdateSchema,
  PaymentStatusSchema as paymentStatusSchema,
} from '../index';

describe('Order input schemas', () => {
  it('accepts only the Domain order and payment statuses', () => {
    expect(orderStatusSchema.parse('shipped')).toBe('shipped');
    expect(paymentStatusSchema.parse('paid')).toBe('paid');
    expect(() => orderStatusSchema.parse('unknown')).toThrow();
    expect(() => paymentStatusSchema.parse('unknown')).toThrow();
  });

  it('parses a status update with optional Staff fields', () => {
    expect(
      orderStatusUpdateSchema.parse({
        status: 'processing',
        parcelBackInWarehouse: false,
        trackingNumber: 'TRK-1',
        adminNotes: 'packed',
      }),
    ).toEqual({
      status: 'processing',
      parcelBackInWarehouse: false,
      trackingNumber: 'TRK-1',
      adminNotes: 'packed',
    });
    expect(orderStatusUpdateSchema.parse({ status: 'confirmed' })).toEqual({
      status: 'confirmed',
    });
  });

  it('rejects a status update with a wrongly typed Staff field', () => {
    expect(() =>
      orderStatusUpdateSchema.parse({ status: 'confirmed', trackingNumber: 42 }),
    ).toThrow();
  });
});
