import { DomainError, LINE_QUANTITY_MAX, LINE_QUANTITY_MIN, isLineQuantity } from '../../../common';
import type { VariantId } from '../../../catalog';
import { InventoryError } from '../../helpers';
import type { StockBalance, Warehouse } from '../../types';
import { activeWarehouseIds, freeUnits } from '../availability';
import type { StockAllocation, StockLine, StockShortfall } from './types';

/** A variant an Order needs more of than is available. */
export class InsufficientStockError extends DomainError<'INSUFFICIENT_STOCK'> {
  readonly shortfalls: readonly StockShortfall[];

  constructor(shortfalls: readonly StockShortfall[]) {
    super(
      'INSUFFICIENT_STOCK',
      `Insufficient stock for variant(s) ${shortfalls.map((s) => s.variantId).join(', ')}`,
    );
    this.shortfalls = shortfalls;
  }
}

/** The lines summed per variant, in variant order. Each line holds 1 to 999 units. */
function totalPerVariant(lines: readonly StockLine[]): StockLine[] {
  const totals = new Map<VariantId, number>();
  for (const { variantId, quantity } of lines) {
    if (!isLineQuantity(quantity)) {
      throw new InventoryError(
        'INVALID_QUANTITY',
        `A stock line holds ${String(LINE_QUANTITY_MIN)} to ${String(LINE_QUANTITY_MAX)} units, received ${String(quantity)}`,
      );
    }
    totals.set(variantId, (totals.get(variantId) ?? 0) + quantity);
  }
  return [...totals]
    .map(([variantId, quantity]) => ({ variantId, quantity }))
    .sort((a, b) => a.variantId - b.variantId);
}

/**
 * Allocates an Order's lines to warehouses for its Stock Reservation (ADR-0005, CO-4). Lines of
 * the same variant are summed. Each variant is filled greedily from active warehouses in
 * warehouse order, taking only free units (on hand less reserved). The result is in variant,
 * then warehouse order, so the same stock always gives the same allocation.
 *
 * It is all-or-nothing: when any variant falls short, nothing is allocated and an
 * `InsufficientStockError` names every short variant.
 */
export function allocateStock(
  lines: readonly StockLine[],
  balances: readonly StockBalance[],
  warehouses: readonly Warehouse[],
): StockAllocation[] {
  const active = activeWarehouseIds(warehouses);
  const usable = balances
    .filter((b) => active.has(b.warehouseId))
    .sort((a, b) => a.warehouseId - b.warehouseId);

  const allocations: StockAllocation[] = [];
  const shortfalls: StockShortfall[] = [];
  for (const { variantId, quantity } of totalPerVariant(lines)) {
    let remaining = quantity;
    let available = 0;
    for (const balance of usable.filter((b) => b.variantId === variantId)) {
      const free = freeUnits(balance);
      available += free;
      const take = Math.min(free, remaining);
      if (take > 0) {
        allocations.push({ variantId, warehouseId: balance.warehouseId, quantity: take });
        remaining -= take;
      }
    }
    if (remaining > 0) shortfalls.push({ variantId, requested: quantity, available });
  }
  if (shortfalls.length > 0) throw new InsufficientStockError(shortfalls);
  return allocations;
}
