import type { ShippingAddress, VariantSnapshot } from "../value-objects";

/**
 * Order Item with product snapshots at time of purchase.
 */
export interface OrderItem {
  id?: number;
  orderId?: number;
  /** Reference to the current product */
  productId: number;
  /** Units purchased */
  quantity: number;
  /** Price at which the item was purchased (legacy field name) */
  priceAtTime?: number;
  /** Current display price */
  price?: number;
  /** Product name captured at time of purchase to handle future name changes */
  productNameSnapshot?: string;
  /** SKU captured at time of purchase */
  productSkuSnapshot?: string;
  /** Per-unit price at time of purchase */
  unitPriceSnapshot?: number;
  /** Selection snapshots (e.g., color, size) */
  variantSnapshot?: VariantSnapshot;
  /** Total for this line (quantity * unitPriceSnapshot) */
  totalPrice?: number;
  /** Human-readable variant summary */
  variantDetails?: string;
  productName?: string;
}

/**
 * Order Domain Interface
 *
 * Lifecycle: status (pending → confirmed → processing → shipped → delivered / cancelled / refunded)
 * paymentStatus: unpaid → paid → refunded
 */
export interface Order {
  /** Unique Order ID or Reference */
  id: number | string;
  /** ID of the registered user (optional for guest checkout) */
  userId?: number;
  /** Email used for guest checkout */
  guestEmail?: string;
  /** Current logistics status */
  status: string;
  /** Current financial status */
  paymentStatus?: string;
  /** Sum of all order item prices */
  subtotal?: number;
  /** Shipping and handling fees */
  shippingCost?: number;
  /** Final amount charged (subtotal + shippingCost) */
  totalAmount?: number;
  /** ISO currency code (e.g., 'EGP') */
  currency?: string;
  /** Method of payment (e.g., 'COD', 'Card') */
  paymentMethod?: string;
  /** Delivery address details captured at time of checkout */
  shippingAddressSnapshot?: ShippingAddress;
  /** Courier tracking reference */
  trackingNumber?: string;
  /** Internal staff notes (not visible to customer) */
  adminNotes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
  /** Detailed line items associated with this order */
  items?: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  date?: string;
  total?: number;
}
