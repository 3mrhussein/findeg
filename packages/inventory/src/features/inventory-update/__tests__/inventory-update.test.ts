import { describe, expect, it } from 'vitest';
import {
  InventoryUpdateBodySchema as inventoryUpdateBodySchema,
  InventoryUpdateSchema as inventoryUpdateSchema,
} from '../index';

describe('inventory update schemas', () => {
  it('requires variantId and quantity on the full update', () => {
    expect(inventoryUpdateSchema.safeParse({ variantId: 1, quantity: 5 }).success).toBe(true);
    expect(inventoryUpdateSchema.safeParse({ quantity: 5 }).success).toBe(false);
  });

  it('accepts a body without variantId and rejects unknown movement types', () => {
    expect(
      inventoryUpdateBodySchema.safeParse({ quantity: 2, movementType: 'return' }).success,
    ).toBe(true);
    expect(
      inventoryUpdateBodySchema.safeParse({ quantity: 2, movementType: 'theft' }).success,
    ).toBe(false);
  });
});
