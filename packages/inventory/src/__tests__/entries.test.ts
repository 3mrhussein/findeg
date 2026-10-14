import { describe, expect, it, vi } from 'vitest';

vi.mock('@findeg/db/queries', () => ({ inventoryQueries: { getAllBalances: vi.fn() } }));
vi.mock('@findeg/catalog', () => ({
  createProductService: () => ({}),
}));

import {
  createAdminInventoryService,
  createInventoryService,
  InventoryUpdateSchema as inventoryUpdateSchema,
} from '../index';

describe('@findeg/inventory entries', () => {
  it('creates a fresh read service on every call', () => {
    expect(createInventoryService()).not.toBe(createInventoryService());
  });

  it('creates fresh admin services with the supplied audit port', () => {
    const first = createAdminInventoryService({ logAction: async () => {} });
    expect(first).not.toBe(createAdminInventoryService({ logAction: async () => {} }));
    expect(typeof first.updateStock).toBe('function');
  });

  it('exposes the inventory update schema from the root entry', () => {
    expect(inventoryUpdateSchema.safeParse({ variantId: 1, quantity: 2 }).success).toBe(true);
  });
});
