import { afterAll, beforeAll, expect, it } from 'vitest';
import { eq, inArray } from 'drizzle-orm';
import { products, productVariants, inventoryBalances, warehouses } from '@findeg/db/schema';
import { getAvailableQuantities } from '@findeg/db/queries/school-supply-lists';
import { getLowStockCountRaw, inventoryQueries } from '@findeg/db/queries';
import { availableStock, stockLevel, type StockBalance, type Warehouse } from '@findeg/domain';
import { connectToTestDatabase, type TestDatabase } from './index';

let testDb: TestDatabase;
beforeAll(() => {
  testDb = connectToTestDatabase();
});
afterAll(async () => {
  await testDb.db.delete(products).where(eq(products.slug, 'availability-parity'));
  await testDb.db
    .delete(warehouses)
    .where(
      inArray(warehouses.code, [
        'availability-active-a',
        'availability-active-b',
        'availability-inactive',
      ]),
    );
  await testDb.close();
});

it('availability and low-stock queries match the domain across active warehouses, reservations, missing balances and 0/1/5/6 boundaries', async () => {
  const initialLowStock = await getLowStockCountRaw();
  const [product] = await testDb.db
    .insert(products)
    .values({
      slug: 'availability-parity',
      localizedName: { en: 'Pen' },
      localizedDescription: { en: '' },
      localizedLongDescription: { en: '' },
    })
    .returning();
  const warehouseRows = await testDb.db
    .insert(warehouses)
    .values([
      { code: 'availability-active-a', name: 'A', isActive: true },
      { code: 'availability-active-b', name: 'B', isActive: true },
      { code: 'availability-inactive', name: 'C', isActive: false },
    ])
    .returning();
  const variants = await testDb.db
    .insert(productVariants)
    .values(
      ['missing', 'zero', 'one', 'five', 'six', 'split-six', 'inactive-only'].map((key) => ({
        productId: product.id,
        variantKey: key,
        sku: `availability-${key}`,
        basePrice: '0.01',
      })),
    )
    .returning();
  const [a, b, inactive] = warehouseRows;
  const balances = await testDb.db
    .insert(inventoryBalances)
    .values([
      { variantId: variants[1].id, warehouseId: a.id, onHand: 5, reserved: 5 },
      { variantId: variants[2].id, warehouseId: a.id, onHand: 4, reserved: 3 },
      { variantId: variants[3].id, warehouseId: a.id, onHand: 7, reserved: 4 },
      { variantId: variants[3].id, warehouseId: b.id, onHand: 3, reserved: 1 },
      { variantId: variants[3].id, warehouseId: inactive.id, onHand: 100 },
      { variantId: variants[4].id, warehouseId: a.id, onHand: 9, reserved: 3 },
      { variantId: variants[5].id, warehouseId: a.id, onHand: 3 },
      { variantId: variants[5].id, warehouseId: b.id, onHand: 3 },
      { variantId: variants[6].id, warehouseId: inactive.id, onHand: 1 },
    ])
    .returning();
  const domainWarehouses = warehouseRows.map((row) => ({
    id: row.id as Warehouse['id'],
    name: row.name,
    status: row.isActive ? ('active' as const) : ('inactive' as const),
  }));
  const domainBalances = balances.map((row) => ({
    ...row,
    variantId: row.variantId as StockBalance['variantId'],
    warehouseId: row.warehouseId as StockBalance['warehouseId'],
  }));
  const expected = variants.map((row) =>
    availableStock(row.id as StockBalance['variantId'], domainBalances, domainWarehouses),
  );
  expect(expected).toEqual([0, 0, 1, 5, 6, 6, 0]);
  const quantities = await getAvailableQuantities(
    testDb.db,
    variants.map((row) => row.id),
  );
  expect(variants.map((row) => quantities.get(row.id) ?? 0)).toEqual(expected);
  const warehouseBalances = await inventoryQueries.getAllBalances(variants[3].id);
  expect(warehouseBalances.map((row) => row.available).sort((a, b) => a - b)).toEqual([0, 2, 3]);
  expect(
    await inventoryQueries.reserveStock(variants[6].id, inactive.id, 1, 'inactive-reservation'),
  ).toBe(false);
  const lowStock = await inventoryQueries.getLowStock();
  expect(
    [
      ...new Set(
        lowStock
          .filter((row) => variants.some((v) => v.id === row.variant.id))
          .map((row) => row.variant.id),
      ),
    ].sort(),
  ).toEqual(
    variants
      .filter((_, i) => stockLevel(expected[i]) === 'low-stock')
      .map((row) => row.id)
      .sort(),
  );
  // Compare against the existing database so file execution order does not matter.
  expect(await getLowStockCountRaw()).toBe(initialLowStock + 2);
  await testDb.db.delete(inventoryBalances).where(eq(inventoryBalances.variantId, variants[2].id));
  expect(await getLowStockCountRaw()).toBe(initialLowStock + 1);
});
