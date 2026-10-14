import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import {
  categories,
  inventoryBalances,
  products,
  productVariants,
  stockMovements,
  warehouses,
} from '@findeg/db/schema';
import { connectToTestDatabase, type TestDatabase } from '../../../testing/postgres';
import { adjustStock } from '@findeg/db/queries';
import { AdminInventoryService } from '../application/services/AdminInventoryService';
import type { IAuditLogService } from '@findeg/catalog';

describe('Admin inventory adjustment integration on real PostgreSQL', () => {
  let testDb: TestDatabase;
  let sequence = 0;
  const mockAuditLog: IAuditLogService = {
    logAction: async () => {},
    getLogs: async () => ({ data: [], total: 0 }),
    getEntityLogs: async () => [],
    getRecentActivity: async () => [],
  };
  const service = new AdminInventoryService(mockAuditLog);

  beforeAll(() => {
    testDb = connectToTestDatabase();
  });

  afterAll(async () => {
    await testDb.close();
  });

  async function seedVariant() {
    sequence += 1;
    const [category] = await testDb.db
      .insert(categories)
      .values({ slug: `inv-cat-${sequence}-${Date.now()}` })
      .returning();
    const [product] = await testDb.db
      .insert(products)
      .values({
        slug: `inv-prod-${sequence}-${Date.now()}`,
        localizedName: { en: 'Notebook', ar: 'دفتر' },
        localizedDescription: { en: '', ar: '' },
        localizedLongDescription: { en: '', ar: '' },
        categoryId: category.id,
      })
      .returning();
    const [variant] = await testDb.db
      .insert(productVariants)
      .values({
        productId: product.id,
        variantKey: 'default',
        sku: `SKU-INV-${sequence}-${Date.now()}`,
        basePrice: '25.00',
      })
      .returning();
    return variant.id;
  }

  async function ensureActiveWarehouse() {
    sequence += 1;
    const [row] = await testDb.db
      .insert(warehouses)
      .values({
        code: `WH-ACTIVE-${sequence}-${Date.now()}`,
        name: `Warehouse ${sequence}`,
        isActive: true,
      })
      .returning();
    return row.id;
  }

  it('adjusts inventory without a warehouse id by resolving the active warehouse inside a transaction', async () => {
    await ensureActiveWarehouse();
    const [expected] = await testDb.db
      .select({ id: warehouses.id })
      .from(warehouses)
      .where(eq(warehouses.isActive, true))
      .orderBy(warehouses.id)
      .limit(1);
    const warehouseId = expected.id;
    const variantId = await seedVariant();

    // 1. Initial adjustment without warehouseId
    await service.updateStock({
      variantId,
      quantity: 50,
      notes: 'Initial stock intake',
    });

    // Verify balance was created for the resolved warehouse
    const balances = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));

    expect(balances).toHaveLength(1);
    expect(balances[0].onHand).toBe(50);
    expect(balances[0].warehouseId).toBe(warehouseId);

    // Verify stock movement was recorded
    const movements = await testDb.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.variantId, variantId));

    expect(movements).toHaveLength(1);
    expect(movements[0].quantity).toBe(50);
    expect(movements[0].movementType).toBe('adjustment');

    // 2. Second adjustment without warehouseId (decrease to 30)
    await service.updateStock({
      variantId,
      quantity: 30,
      notes: 'Count correction',
    });

    const updatedBalances = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));

    expect(updatedBalances).toHaveLength(1);
    expect(updatedBalances[0].onHand).toBe(30);

    const updatedMovements = await testDb.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.variantId, variantId));

    expect(updatedMovements).toHaveLength(2);
    // Diff was -20
    expect(updatedMovements[1].quantity).toBe(-20);
    expect(updatedMovements[1].movementType).toBe('adjustment');
  });
  it('applies both simultaneous first adjustments and records both movements', async () => {
    const warehouseId = await ensureActiveWarehouse();
    const variantId = await seedVariant();
    await Promise.all(
      [10, 20].map((quantity) =>
        adjustStock(variantId, warehouseId, {
          movementType: 'adjustment',
          quantity,
        }),
      ),
    );
    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.variantId, variantId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      );
    expect(balance.onHand).toBe(30);
    const movements = await testDb.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.variantId, variantId));
    expect(movements).toHaveLength(2);
    expect(movements.reduce((sum, movement) => sum + movement.quantity, 0)).toBe(30);
  });

  it('refuses a negative first adjustment without creating balance or movement', async () => {
    const warehouseId = await ensureActiveWarehouse();
    const variantId = await seedVariant();
    await expect(
      adjustStock(variantId, warehouseId, { movementType: 'adjustment', quantity: -1 }),
    ).rejects.toThrow();
    expect(
      await testDb.db
        .select()
        .from(inventoryBalances)
        .where(eq(inventoryBalances.variantId, variantId)),
    ).toEqual([]);
    expect(
      await testDb.db.select().from(stockMovements).where(eq(stockMovements.variantId, variantId)),
    ).toEqual([]);
  });

  it('serializes first-time absolute stock corrections instead of adding both targets', async () => {
    const warehouseId = await ensureActiveWarehouse();
    const variantId = await seedVariant();
    await Promise.all(
      [30, 40].map((quantity) => service.updateStock({ variantId, warehouseId, quantity })),
    );
    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    expect([30, 40]).toContain(balance.onHand);
    const movements = await testDb.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.variantId, variantId));
    expect(movements.reduce((sum, movement) => sum + movement.quantity, 0)).toBe(balance.onHand);
  });

  it('keeps a concurrent recount at one requested quantity after existing stock', async () => {
    const warehouseId = await ensureActiveWarehouse();
    const variantId = await seedVariant();
    await service.updateStock({ variantId, warehouseId, quantity: 50 });
    await Promise.all(
      [30, 40].map((quantity) => service.updateStock({ variantId, warehouseId, quantity })),
    );
    const [balance] = await testDb.db
      .select()
      .from(inventoryBalances)
      .where(eq(inventoryBalances.variantId, variantId));
    expect([30, 40]).toContain(balance.onHand);
  });
});
