import type { VariantId } from '../../../catalog';
import type { StockBalance, Warehouse, WarehouseId } from '../../types';
import { LOW_STOCK_MAX_UNITS } from './constants';
import type { StockLevel } from './types';

/** The stock level of a number of available units: none, 1 to 5, or more. */
export function stockLevel(available: number): StockLevel {
  if (available <= 0) return 'out-of-stock';
  return available <= LOW_STOCK_MAX_UNITS ? 'low-stock' : 'in-stock';
}

/** The ids of the warehouses stock is sold from. A warehouse not listed is not one of them. */
export function activeWarehouseIds(warehouses: readonly Warehouse[]): ReadonlySet<WarehouseId> {
  return new Set(warehouses.filter((w) => w.status === 'active').map((w) => w.id));
}

/** Units of one balance free to sell: on hand less reserved, never below zero. */
export function freeUnits(balance: Pick<StockBalance, 'onHand' | 'reserved'>): number {
  return Math.max(balance.onHand - balance.reserved, 0);
}

/**
 * Units of a variant a Customer can buy: on hand less reserved, summed over active warehouses
 * and never below zero. A variant with no stock rows has none available.
 */
export function availableStock(
  variantId: VariantId,
  balances: readonly StockBalance[],
  warehouses: readonly Warehouse[],
): number {
  const active = activeWarehouseIds(warehouses);
  return balances
    .filter((b) => b.variantId === variantId && active.has(b.warehouseId))
    .reduce((sum, b) => sum + freeUnits(b), 0);
}
