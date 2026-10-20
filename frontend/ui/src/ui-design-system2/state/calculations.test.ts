import { describe, expect, it } from 'vitest';
import { calculateTotals } from './calculations';
import type { SupplyListEntry } from './types';

describe('calculateTotals', () => {
  it('returns zeroes for empty supply list', () => {
    const totals = calculateTotals({}, true);
    expect(totals).toEqual({
      totalQty: 0,
      grossSubtotal: 0,
      ownedDeduction: 0,
      netBeforeDiscount: 0,
      eduDiscount: 0,
      finalTotal: 0,
    });
  });

  it('calculates unowned items with 15% edu discount active', () => {
    const items: Record<string, SupplyListEntry> = {
      item1: { id: 'item1', title: 'Journal', price: 14.0, qty: 2, owned: false },
    };
    const totals = calculateTotals(items, true);
    // 14 * 2 = 28.00 gross
    // owned = 0
    // netBefore = 28.00
    // edu discount = 28 * 0.15 = 4.20
    // final = 23.80
    expect(totals.totalQty).toBe(2);
    expect(totals.grossSubtotal).toBe(28);
    expect(totals.ownedDeduction).toBe(0);
    expect(totals.netBeforeDiscount).toBe(28);
    expect(totals.eduDiscount).toBeCloseTo(4.2, 2);
    expect(totals.finalTotal).toBeCloseTo(23.8, 2);
  });

  it('calculates unowned items with edu discount disabled', () => {
    const items: Record<string, SupplyListEntry> = {
      item1: { id: 'item1', title: 'Journal', price: 14.0, qty: 2, owned: false },
    };
    const totals = calculateTotals(items, false);
    expect(totals.eduDiscount).toBe(0);
    expect(totals.finalTotal).toBe(28);
  });

  it('zeroes net total for items marked as already owned at home', () => {
    const items: Record<string, SupplyListEntry> = {
      item1: { id: 'item1', title: 'Journal', price: 14.0, qty: 2, owned: true },
    };
    const totals = calculateTotals(items, true);
    expect(totals.totalQty).toBe(2);
    expect(totals.grossSubtotal).toBe(28);
    expect(totals.ownedDeduction).toBe(28);
    expect(totals.netBeforeDiscount).toBe(0);
    expect(totals.eduDiscount).toBe(0);
    expect(totals.finalTotal).toBe(0);
  });

  it('correctly calculates mixed owned and unowned items', () => {
    const items: Record<string, SupplyListEntry> = {
      item1: { id: 'item1', title: 'Journal', price: 14.0, qty: 1, owned: false },
      item2: { id: 'item2', title: 'Gel Pens', price: 12.5, qty: 2, owned: false },
      item3: { id: 'item3', title: 'Ruler', price: 8.5, qty: 1, owned: true },
    };
    // gross = 14 + 25 + 8.5 = 47.5
    // owned = 8.5
    // netBefore = 39.0
    // discount = 39 * 0.15 = 5.85
    // final = 33.15
    const totals = calculateTotals(items, true);
    expect(totals.totalQty).toBe(4);
    expect(totals.grossSubtotal).toBe(47.5);
    expect(totals.ownedDeduction).toBe(8.5);
    expect(totals.netBeforeDiscount).toBe(39);
    expect(totals.eduDiscount).toBeCloseTo(5.85, 2);
    expect(totals.finalTotal).toBeCloseTo(33.15, 2);
  });
});
