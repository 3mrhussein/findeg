import type { orders, orderItems } from '@findeg/db/schema';
import { toPiasters } from '../core/money';
import type { Order } from './domain/entities/Order';

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;

/** Canonical price fields were backfilled by migration 0015 (ADR-0007). */
export function mapOrder(
  row: OrderRow,
  items: OrderItemRow[],
  customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null,
): Order {
  const customerName =
    (customer
      ? [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
      : row.shippingAddressSnapshot?.fullName) || 'Guest';
  return {
    id: row.id,
    orderReference: row.orderReference,
    userId: row.userId ?? undefined,
    guestEmail: row.guestEmail ?? undefined,
    status: row.status,
    paymentStatus: row.paymentStatus,
    subtotal: toPiasters(row.subtotal),
    shippingCost: toPiasters(row.shippingCost ?? '0'),
    discountTotal: toPiasters(row.discountTotal),
    totalAmount: toPiasters(row.totalAmount),
    currency: row.currency,
    paymentMethod: row.paymentMethod ?? undefined,
    shippingAddressSnapshot: row.shippingAddressSnapshot ?? undefined,
    trackingNumber: row.trackingNumber ?? undefined,
    adminNotes: row.adminNotes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customerName,
    customerEmail: customer?.email ?? row.guestEmail ?? undefined,
    items: items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
      unitPrice: toPiasters(item.unitPrice),
      discountAmount: toPiasters(item.discountAmount),
      lineTotal: toPiasters(item.lineTotal),
      productNameSnapshot: item.productNameSnapshot ?? undefined,
      productSkuSnapshot: item.productSkuSnapshot ?? undefined,
      variantSkuSnapshot: item.variantSkuSnapshot ?? undefined,
      variantSnapshot: item.variantSnapshot ?? undefined,
    })),
  };
}
