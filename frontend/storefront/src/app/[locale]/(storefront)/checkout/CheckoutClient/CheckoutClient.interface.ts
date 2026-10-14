import type { Money } from '@findeg/domain';
/**
 * CheckoutClient — shared types & interfaces
 */

import { type CheckoutPrefillData } from '@/data/order/queries';
import type { PublicSupplyList } from '@findeg/school-lists';

export interface CheckoutTotals {
  subtotal: Money;
  shippingCost: Money;
  total: Money;
  currency: string;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: number;
  orderReference?: string;
  message?: string;
}

export interface CheckoutClientProps {
  initialPrefill?: CheckoutPrefillData | null;
  checkoutSource?:
    { source: 'cart' } | { source: 'list'; publicCode: string; list: PublicSupplyList };
}

/**
 * Retrieves or generates a stable guest ID stored in localStorage.
 */
export function getGuestId(): string {
  const storageKey = 'findeg_guest_id';
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = `guest_${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}
