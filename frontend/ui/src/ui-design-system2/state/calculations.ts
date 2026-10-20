import type { SupplyListEntry, SupplyTotals } from './types';

/**
 * Computes exact financial subtotals, home deductions, .EDU student discount,
 * and final payable amount for a collection of supply list items.
 */
export function calculateTotals(
  items: Record<string, SupplyListEntry>,
  eduDiscountActive: boolean,
): SupplyTotals {
  const activeItems = Object.values(items).filter((i) => i.qty > 0);
  const totalQty = activeItems.reduce((acc, i) => acc + i.qty, 0);
  const grossSubtotal = activeItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const ownedDeduction = activeItems.reduce((sum, i) => sum + (i.owned ? i.price * i.qty : 0), 0);
  const netBeforeDiscount = Math.max(0, grossSubtotal - ownedDeduction);
  const eduDiscount = eduDiscountActive ? netBeforeDiscount * 0.15 : 0;
  const finalTotal = Math.max(0, netBeforeDiscount - eduDiscount);

  return {
    totalQty,
    grossSubtotal,
    ownedDeduction,
    netBeforeDiscount,
    eduDiscount,
    finalTotal,
  };
}
