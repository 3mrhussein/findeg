import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain/common';
import type { VariantId } from '@findeg/domain/catalog';
import { ORDER_STATUSES } from '@findeg/domain/orders';
import {
  LOW_STOCK_MAX_UNITS,
  RESERVATION_STATES,
  STOCK_LEVELS,
  availableStock,
  reservationSettlement,
  reservationState,
  stockLevel,
  type Warehouse,
  type WarehouseId,
} from '@findeg/domain/inventory';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return error.code;
    throw error;
  }
}

const pen = 1 as VariantId;
const pencil = 2 as VariantId;
const cairo = 10 as WarehouseId;
const giza = 20 as WarehouseId;
const closed = 30 as WarehouseId;

const warehouses: Warehouse[] = [
  { id: cairo, name: 'Cairo', status: 'active' },
  { id: giza, name: 'Giza', status: 'active' },
  { id: closed, name: 'Old store', status: 'inactive' },
];

const balance = (variantId: VariantId, warehouseId: WarehouseId, onHand: number, reserved = 0) => ({
  variantId,
  warehouseId,
  onHand,
  reserved,
});

// Characterised from db getAvailableQuantities (list read and publish warning):
// sum(on hand - reserved) over active warehouses, 0 for a variant with no stock rows.
describe('available stock', () => {
  it('is on hand less reserved', () => {
    expect(availableStock(pen, [balance(pen, cairo, 5, 2)], warehouses)).toBe(3);
  });

  it('sums every active warehouse', () => {
    const balances = [balance(pen, cairo, 1, 1), balance(pen, giza, 4, 3)];
    expect(availableStock(pen, balances, warehouses)).toBe(1);
  });

  it('counts only the asked variant', () => {
    const balances = [balance(pen, cairo, 2), balance(pencil, cairo, 9)];
    expect(availableStock(pen, balances, warehouses)).toBe(2);
  });

  it('change: is 0 with no stock rows (the Storefront showed the variant in stock)', () => {
    expect(availableStock(pen, [], warehouses)).toBe(0);
  });

  it('change: ignores inactive warehouses (the Backend Variant summed every warehouse)', () => {
    const balances = [balance(pen, cairo, 2), balance(pen, closed, 50)];
    expect(availableStock(pen, balances, warehouses)).toBe(2);
  });

  it('ignores stock in a warehouse it does not know', () => {
    expect(availableStock(pen, [balance(pen, 99 as WarehouseId, 7)], warehouses)).toBe(0);
  });

  it('change: subtracts reserved units (the Storefront counted on hand only)', () => {
    expect(availableStock(pen, [balance(pen, cairo, 5, 5)], warehouses)).toBe(0);
  });

  it('is never below zero, and an over-reserved row takes nothing from the others', () => {
    const balances = [balance(pen, cairo, 1, 3), balance(pen, giza, 2)];
    expect(availableStock(pen, balances, warehouses)).toBe(2);
    expect(availableStock(pen, [balance(pen, cairo, 1, 3)], warehouses)).toBe(0);
  });
});

// Characterised from the Backend's Variant.isLowStock: 1 to 5 available units.
describe('stock level', () => {
  it.each([
    [0, 'out-of-stock'],
    [1, 'low-stock'],
    [3, 'low-stock'],
    [6, 'in-stock'],
    [999, 'in-stock'],
  ] as const)('%s available units are %s', (available, level) => {
    expect(stockLevel(available)).toBe(level);
  });

  it('change: 5 available units are low stock (the Storefront warned only below 5)', () => {
    expect(stockLevel(5)).toBe('low-stock');
  });

  it('change: 0 available units are out of stock, not low stock (the Dashboard counted them as low)', () => {
    expect(stockLevel(0)).toBe('out-of-stock');
  });

  it('pins the low-stock ceiling and the levels', () => {
    expect(LOW_STOCK_MAX_UNITS).toBe(5);
    expect(STOCK_LEVELS).toEqual(['out-of-stock', 'low-stock', 'in-stock']);
  });
});

// Characterised from @findeg/orders changeStatus and db settleOrderStock (ADR-0005): a
// reservation is held from Order Acceptance, consumed on delivery, released on cancellation,
// refund has no stock effect, and a settled reservation cannot be settled the other way.
describe('Stock Reservation by Order status', () => {
  it.each([
    ['pending', 'held'],
    ['confirmed', 'held'],
    ['processing', 'held'],
    ['shipped', 'held'],
    ['delivered', 'consumed'],
    ['cancelled', 'released'],
    ['refunded', 'consumed'],
  ] as const)('an Order that is %s has its reservation %s', (status, state) => {
    expect(reservationState(status)).toBe(state);
  });

  it('covers every Order status', () => {
    for (const status of ORDER_STATUSES)
      expect(RESERVATION_STATES).toContain(reservationState(status));
  });

  it.each([
    ['pending', 'confirmed', null],
    ['pending', 'cancelled', 'release'],
    ['confirmed', 'processing', null],
    ['confirmed', 'cancelled', 'release'],
    ['processing', 'shipped', null],
    ['processing', 'cancelled', 'release'],
    ['shipped', 'delivered', 'consume'],
    ['shipped', 'cancelled', 'release'],
    ['delivered', 'refunded', null],
  ] as const)('moving %s → %s settles it with %s', (from, to, settlement) => {
    expect(reservationSettlement(from, to)).toBe(settlement);
  });

  it.each(ORDER_STATUSES)('a same-status change (%s) has no stock effect', (status) => {
    expect(reservationSettlement(status, status)).toBeNull();
  });

  it.each([
    ['cancelled', 'delivered'],
    ['delivered', 'cancelled'],
    ['refunded', 'cancelled'],
  ] as const)('refuses %s → %s: the reservation was settled the other way', (from, to) => {
    expect(codeOf(() => reservationSettlement(from, to))).toBe('RESERVATION_ALREADY_SETTLED');
  });
});
