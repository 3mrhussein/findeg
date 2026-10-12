import 'server-only';
import { createInventoryService } from '@findeg/backend/features/catalog';
import type { Product } from './types';
import { mapProduct } from '../helpers/mappers';

/** Hydrate stock before mapping products, including inactive warehouse balances. */
export async function mapProductsWithInventory(
  products: Product[],
  locale: string,
): Promise<Product[]> {
  const inventory = createInventoryService();
  return Promise.all(
    products.map(async (product) => {
      const variants = await Promise.all(
        (product.variants || []).map(async (variant) => {
          const balances = await inventory.getWarehouseBalances(variant.id);
          return {
            ...variant,
            inventory: balances.map((balance) => ({
              warehouseActive: balance.isActive,
              warehouseId: balance.warehouseId,
              warehouseCode: balance.warehouseCode,
              onHand: balance.onHand,
              reserved: balance.reserved,
            })),
          };
        }),
      );
      return mapProduct({ ...product, variants }, locale);
    }),
  );
}
