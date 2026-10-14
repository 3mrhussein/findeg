import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixtures = vi.hoisted(() => ({
  productService: { getById: vi.fn(), getFilteredProducts: vi.fn() },
  auditLog: { logAction: vi.fn() },
  db: {
    adjustStock: vi.fn(),
    getLowStock: vi.fn(),
    getVariantsByIds: vi.fn(),
    withTransaction: vi.fn(),
    warehouseRows: [] as unknown[][],
    balanceRows: [] as unknown[][],
    inserts: [] as unknown[],
  },
}));

vi.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => args,
  eq: (...args: unknown[]) => args,
}));
vi.mock('@findeg/db/schema', () => ({
  inventoryBalances: { onHand: 'balance.onHand', variantId: 'balance.variantId' },
  warehouses: { id: 'warehouse.id', isActive: 'warehouse.isActive' },
}));
vi.mock('@findeg/catalog', () => ({
  createProductService: () => fixtures.productService,
  createAuditLogService: () => fixtures.auditLog,
}));
vi.mock('@findeg/db/queries', () => ({
  adjustStock: fixtures.db.adjustStock,
  getLowStock: fixtures.db.getLowStock,
  productQueries: { getVariantsByIds: fixtures.db.getVariantsByIds },
  withTransaction: fixtures.db.withTransaction,
}));

import { createAdminInventoryService } from '../index';

/** Scripted transaction: warehouse selects consume `warehouseRows`, balance selects consume `balanceRows`. */
function scriptedTx() {
  const chain = (resolve: () => unknown) => {
    const c: Record<string, unknown> = {};
    for (const method of [
      'from',
      'where',
      'orderBy',
      'limit',
      'for',
      'values',
      'onConflictDoNothing',
    ]) {
      c[method] = (arg?: unknown) => {
        if (method === 'values') fixtures.db.inserts.push(arg);
        return c;
      };
    }
    c.then = (ok: (v: unknown) => unknown, err: (e: unknown) => unknown) =>
      Promise.resolve(resolve()).then(ok, err);
    return c;
  };
  return {
    select: (shape: Record<string, unknown>) =>
      chain(() =>
        'onHand' in shape ? fixtures.db.balanceRows.shift() : fixtures.db.warehouseRows.shift(),
      ),
    insert: () => chain(() => []),
  };
}

describe('AdminInventoryService', () => {
  let service: ReturnType<typeof createAdminInventoryService>;

  beforeEach(() => {
    vi.clearAllMocks();
    fixtures.db.warehouseRows = [];
    fixtures.db.balanceRows = [];
    fixtures.db.inserts = [];
    fixtures.db.getVariantsByIds.mockResolvedValue([{ id: 7 }]);
    fixtures.db.withTransaction.mockImplementation(
      async (_c: unknown, fn: (tx: unknown) => unknown) => fn(scriptedTx()),
    );
    service = createAdminInventoryService(fixtures.auditLog as never);
  });

  describe('getInventory', () => {
    it('lists all products through the product service when not filtering to low stock', async () => {
      fixtures.productService.getFilteredProducts.mockResolvedValue({
        products: [{ id: 1 }],
        total: 1,
      });
      const result = await service.getInventory(false, 10, 5);
      expect(fixtures.productService.getFilteredProducts).toHaveBeenCalledWith({
        limit: 10,
        offset: 5,
        sort: 'newest',
      });
      expect(result).toEqual({ products: [{ id: 1 }], total: 1 });
    });

    it('pages distinct low-stock products and drops products that no longer resolve', async () => {
      fixtures.db.getLowStock.mockResolvedValue([
        { variant: { productId: 1 } },
        { variant: { productId: 1 } },
        { variant: { productId: 2 } },
        { variant: { productId: 3 } },
      ]);
      fixtures.productService.getById.mockImplementation(async (id: number) =>
        id === 2 ? null : { id },
      );
      const result = await service.getInventory(true, 2, 0);
      expect(fixtures.productService.getById).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ products: [{ id: 1 }], total: 3 });
    });

    it('uses default pagination arguments', async () => {
      fixtures.productService.getFilteredProducts.mockResolvedValue({ products: [], total: 0 });
      await service.getInventory();
      expect(fixtures.productService.getFilteredProducts).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        sort: 'newest',
      });
    });
  });

  describe('updateStock', () => {
    it('rejects an unknown variant before opening a transaction', async () => {
      fixtures.db.getVariantsByIds.mockResolvedValue([]);
      await expect(service.updateStock({ variantId: 99, quantity: 3 } as never)).rejects.toThrow(
        'Variant #99 not found',
      );
      expect(fixtures.db.withTransaction).not.toHaveBeenCalled();
    });

    it('adjusts the active warehouse by the difference and audits old and new quantities', async () => {
      fixtures.db.warehouseRows.push([{ id: 4 }]);
      fixtures.db.balanceRows.push([{ onHand: 2 }]);
      await service.updateStock({ variantId: 7, quantity: 5 } as never);
      expect(fixtures.db.adjustStock).toHaveBeenCalledWith(
        7,
        4,
        { movementType: 'adjustment', quantity: 3, notes: 'Admin manual update' },
        expect.any(Object),
      );
      expect(fixtures.auditLog.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: '7',
          oldValues: { onHand: 2 },
          newValues: { onHand: 5, notes: undefined },
        }),
      );
    });

    it('uses the requested warehouse when it exists and skips the adjustment when nothing changes', async () => {
      fixtures.db.warehouseRows.push([{ id: 9 }]);
      fixtures.db.balanceRows.push([{ onHand: 5 }]);
      await service.updateStock({
        variantId: 7,
        warehouseId: 9,
        quantity: 5,
        notes: 'count',
      } as never);
      expect(fixtures.db.adjustStock).not.toHaveBeenCalled();
      expect(fixtures.db.inserts).toEqual([
        { variantId: 7, warehouseId: 9, onHand: 0, reserved: 0 },
      ]);
      expect(fixtures.auditLog.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ newValues: { onHand: 5, notes: 'count' } }),
      );
    });

    it('fails when the requested warehouse does not exist', async () => {
      fixtures.db.warehouseRows.push([]);
      await expect(
        service.updateStock({ variantId: 7, warehouseId: 9, quantity: 1 } as never),
      ).rejects.toThrow('Warehouse #9 not found');
      expect(fixtures.db.adjustStock).not.toHaveBeenCalled();
    });

    it('fails when no active warehouse exists', async () => {
      fixtures.db.warehouseRows.push([]);
      await expect(service.updateStock({ variantId: 7, quantity: 1 } as never)).rejects.toThrow(
        'No active warehouse found',
      );
    });
  });

  describe('bulkUpdateStock', () => {
    it('applies each update in order', async () => {
      fixtures.db.warehouseRows.push([{ id: 1 }], [{ id: 1 }]);
      fixtures.db.balanceRows.push([{ onHand: 0 }], [{ onHand: 0 }]);
      await service.bulkUpdateStock([
        { variantId: 7, quantity: 1 },
        { variantId: 7, quantity: 2 },
      ] as never);
      expect(fixtures.auditLog.logAction).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLowStockAlerts', () => {
    it('returns resolved products for distinct low-stock product ids', async () => {
      fixtures.db.getLowStock.mockResolvedValue([
        { variant: { productId: 1 } },
        { variant: { productId: 1 } },
        { variant: { productId: 4 } },
      ]);
      fixtures.productService.getById.mockImplementation(async (id: number) =>
        id === 4 ? null : { id },
      );
      expect(await service.getLowStockAlerts(3)).toEqual([{ id: 1 }]);
      expect(fixtures.db.getLowStock).toHaveBeenCalledWith(3);
    });
  });
});
