import {
  ID,
  Price,
  Sku,
  Quantity,
  Email,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@features/core/domain/types/common";
import type { CurrencyCode } from "@features/core/domain/value-objects";
import type { ShippingAddress, VariantSnapshot } from "../value-objects";

/**
 * Order Item with product snapshots at time of purchase.
 */
export interface OrderItem {
  id?: ID;
  orderId?: ID | string;
  /** Reference to the current product */
  productId: ID;
  /** The specific variant purchased */
  variantId?: ID;
  /** Units purchased */
  quantity: Quantity;
  /** Selected Unit of Measure */
  uomCode?: string;
  /** Current display price */
  price?: Price;
  unitPrice?: Price;
  /** Product name captured at time of purchase to handle future name changes */
  productNameSnapshot?: string;
  /** SKU captured at time of purchase */
  productSkuSnapshot?: Sku;
  /** Per-unit price at time of purchase */
  unitPriceSnapshot?: Price;
  /** Selection snapshots (e.g., color, size) */
  variantSnapshot?: VariantSnapshot;
  /** Total for this line (quantity * unitPriceSnapshot) */
  totalPrice?: Price;
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
  id: ID | string;
  /** ID of the registered user (optional for guest checkout) */
  userId?: ID;
  /** Email used for guest checkout */
  guestEmail?: Email;
  /** Current logistics status */
  status: OrderStatus;
  /** Current financial status */
  paymentStatus?: PaymentStatus;
  /** Sum of all order item prices */
  subtotal?: Price;
  /** Shipping and handling fees */
  shippingCost?: Price;
  /** Final amount charged (subtotal + shippingCost) */
  totalAmount?: Price;
  /** ISO currency code (e.g., 'EGP') */
  currency?: CurrencyCode;
  /** Method of payment (e.g., 'COD', 'Card') */
  paymentMethod?: PaymentMethod;
  /** Delivery address details captured at time of checkout */
  shippingAddressSnapshot?: ShippingAddress;
  /** Courier tracking reference */
  trackingNumber?: string;
  /** Internal staff notes (not visible to customer) */
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  /** Detailed line items associated with this order */
  items?: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  date?: string;
  total?: number;
}
