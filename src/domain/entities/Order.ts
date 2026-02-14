/**
 * Domain Entity: Order
 *
 * Represents a customer order with full lifecycle tracking.
 * Order items contain product snapshots to preserve data at time of purchase.
 */

import type {
  ShippingAddressSnapshot,
  VariantSnapshot,
} from "@/infrastructure/database/schema/orders";

/**
 * Order Item with product snapshots
 *
 * Stores a frozen copy of product data at the time of purchase,
 * so the order remains accurate even if the product changes later.
 */
export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  /** Price per unit when ordered */
  priceAtTime?: number;
  /** Alias for priceAtTime (presentation use) */
  price?: number;
  /** Product name at time of order */
  productNameSnapshot?: string;
  /** Product SKU at time of order */
  productSkuSnapshot?: string;
  /** Price per unit at time of order */
  unitPriceSnapshot?: number;
  /** Selected variant details at time of order */
  variantSnapshot?: VariantSnapshot;
  /** Total price: quantity × unitPriceSnapshot */
  totalPrice?: number;
  /** Legacy field */
  variantDetails?: string;
  /** Resolved product name (for display) */
  productName?: string;
}

/**
 * Order Domain Interface
 *
 * Full lifecycle:
 * status: pending → confirmed → processing → shipped → delivered / cancelled / refunded
 * paymentStatus: unpaid → paid → refunded
 */
export interface Order {
  id: number | string;
  userId?: number;
  /** Email for guest checkout */
  guestEmail?: string;
  /** Order lifecycle status */
  status: string;
  /** Payment status: unpaid → paid → refunded */
  paymentStatus?: string;
  /** Sum of item prices before shipping */
  subtotal?: number;
  /** Shipping fee */
  shippingCost?: number;
  /** Final total: subtotal + shippingCost */
  totalAmount?: number;
  currency?: string;
  /** Payment method (e.g., "cod", "paymob_card") */
  paymentMethod?: string;
  /** Frozen shipping address at time of order */
  shippingAddressSnapshot?: ShippingAddressSnapshot;
  /** Carrier tracking number */
  trackingNumber?: string;
  /** Internal admin notes */
  adminNotes?: string;
  /** Legacy fields */
  shippingAddress?: string;
  billingAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  items?: OrderItem[];
  // Presentation-friendly aliases
  customerName?: string;
  customerEmail?: string;
  date?: string;
  total?: number;
}
