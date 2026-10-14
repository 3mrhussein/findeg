import type { OutboxEnqueue } from '../order-acceptance/types';
import type { GuestAccessTokens } from '../guest-access-token/types';

export type RequestAccessResult = { success: true } | { success: false; reason: 'invalid-input' };
export type VerifyResult =
  | { success: true; orderReference: string; token: string; maxAgeSeconds: number }
  | { success: false; reason: 'invalid-input' | 'invalid-code' };

export interface GuestOrderView {
  orderReference: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotal: string;
  shippingCost: string | null;
  totalAmount: string;
  createdAt: Date;
  items: Array<{ name: string; quantity: number; totalPrice: string | null }>;
}

export interface GuestAccessServiceOptions {
  /** Writes the access-code outbox row on the request transaction. */
  enqueue: OutboxEnqueue;
  /** Returns the hashing secret; throws when it is not configured (fails closed). */
  secret: () => string;
  /** Signs and verifies the Guest Order token (backend infrastructure). */
  tokens: GuestAccessTokens;
}
