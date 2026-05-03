/**
 * CheckoutClient — shared types & interfaces
 */

import { type CheckoutPrefillData } from '@findeg/backend/features/order/application/services/OrderService';

export interface CheckoutTotals {
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: number;
  message?: string;
}

export interface CheckoutClientProps {
  initialPrefill?: CheckoutPrefillData | null;
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
