import type { Order as StoredOrder, OrderItem as StoredItem, User } from '@findeg/db/schema';
import { toPiasters } from '@findeg/money';
import type { Order } from './types';

function amount(value: string | null): bigint {
  if (value === null) throw new TypeError('Missing canonical Order money snapshot');
  return toPiasters(value);
}

export function mapOrder(row: StoredOrder, items: StoredItem[], user?: User | null): Order {
  return {
    id: row.id,
    orderReference: row.orderReference,
    userId: row.userId,
    guestEmail: row.guestEmail,
    status: row.status,
    paymentStatus: row.paymentStatus,
    subtotal: amount(row.subtotal),
    shippingCost: amount(row.shippingCost),
    discountTotal: amount(row.discountTotal),
    totalAmount: amount(row.totalAmount),
    currency: row.currency,
    paymentMethod: row.paymentMethod,
    shippingAddressSnapshot: row.shippingAddressSnapshot,
    trackingNumber: row.trackingNumber,
    adminNotes: row.adminNotes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customerName:
      (user
        ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
        : row.shippingAddressSnapshot?.fullName) || 'Guest',
    customerEmail: user?.email ?? row.guestEmail,
    items: items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      uomCode: null,
      unitPrice: amount(item.unitPrice),
      discountAmount: amount(item.discountAmount),
      lineTotal: amount(item.lineTotal),
      productNameSnapshot: item.productNameSnapshot,
      productSkuSnapshot: item.productSkuSnapshot,
      variantSkuSnapshot: item.variantSkuSnapshot,
      variantSnapshot: item.variantSnapshot,
    })),
  };
}
