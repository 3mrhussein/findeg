import type { ShippingAddress, VariantSnapshot } from '../value-objects';
import type { OrderStatus, PaymentStatus, PaymentMethod } from '@findeg/db/types';

/** Accepted line snapshots. Every amount is exact integer piasters. */
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  variantId?: number;
  quantity: number;
  unitPrice: bigint;
  discountAmount: bigint;
  lineTotal: bigint;
  productNameSnapshot?: string;
  productSkuSnapshot?: string;
  variantSkuSnapshot?: string;
  variantSnapshot?: VariantSnapshot;
}

/** Order acceptance snapshots with its current lifecycle and Staff metadata. */
export interface Order {
  id: number;
  orderReference: string;
  userId?: number;
  guestEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: bigint;
  shippingCost: bigint;
  discountTotal: bigint;
  totalAmount: bigint;
  currency: string;
  paymentMethod?: PaymentMethod;
  shippingAddressSnapshot?: ShippingAddress;
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
}
