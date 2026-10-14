import { describe, expect, it, vi } from 'vitest';

vi.mock('@findeg/db/queries', () => ({ inventoryQueries: { getAllBalances: vi.fn() } }));
vi.mock('@findeg/catalog', () => ({
  createProductService: () => ({}),
  createAuditLogService: () => ({ logAction: vi.fn() }),
}));

import {
  createAdminInventoryService,
  createInventoryService,
  InventoryUpdateSchema,
} from '../index';

describe('@findeg/inventory entries', () => {
  it('creates a fresh read service on every call', () => {
    expect(createInventoryService()).not.toBe(createInventoryService());
  });

  it('creates admin services that use the catalog audit log when none is injected', () => {
    const first = createAdminInventoryService();
    expect(first).not.toBe(createAdminInventoryService());
    expect(typeof first.updateStock).toBe('function');
  });

  it('exposes the inventory update schema from the root entry', () => {
    expect(InventoryUpdateSchema.safeParse({ variantId: 1, quantity: 2 }).success).toBe(true);
  });
});
