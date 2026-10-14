import { describe, expect, it } from 'vitest';
import { InventoryUpdateBodySchema, InventoryUpdateSchema } from '../index';

describe('inventory update schemas', () => {
  it('requires variantId and quantity on the full update', () => {
    expect(InventoryUpdateSchema.safeParse({ variantId: 1, quantity: 5 }).success).toBe(true);
    expect(InventoryUpdateSchema.safeParse({ quantity: 5 }).success).toBe(false);
  });

  it('accepts a body without variantId and rejects unknown movement types', () => {
    expect(
      InventoryUpdateBodySchema.safeParse({ quantity: 2, movementType: 'return' }).success,
    ).toBe(true);
    expect(
      InventoryUpdateBodySchema.safeParse({ quantity: 2, movementType: 'theft' }).success,
    ).toBe(false);
  });
});
