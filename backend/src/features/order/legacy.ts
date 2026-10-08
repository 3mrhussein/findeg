// Temporary numeric DTO adapter for existing consumers; removed by #368.
import { fromPiasters } from '@findeg/money';
import type { Order as ExactOrder } from '@findeg/orders';
import type { Order } from './domain/entities/Order';
export function toLegacyOrder(order: ExactOrder): Order {
  return {
    id: order.id,
    orderReference: order.orderReference,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customerName: order.customerName,
    userId: order.userId ?? undefined,
    guestEmail: order.guestEmail ?? undefined,
    paymentMethod: order.paymentMethod ?? undefined,
    shippingAddressSnapshot: order.shippingAddressSnapshot ?? undefined,
    trackingNumber: order.trackingNumber ?? undefined,
    adminNotes: order.adminNotes ?? undefined,
    customerEmail: order.customerEmail ?? undefined,
    subtotal: fromPiasters(order.subtotal),
    shippingCost: fromPiasters(order.shippingCost),
    totalAmount: fromPiasters(order.totalAmount),
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      variantId: item.variantId ?? undefined,
      uomCode: item.uomCode ?? undefined,
      unitPrice: fromPiasters(item.unitPrice),
      unitPriceSnapshot: fromPiasters(item.unitPrice),
      totalPrice: fromPiasters(item.lineTotal),
      productNameSnapshot: item.productNameSnapshot ?? undefined,
      productSkuSnapshot: item.productSkuSnapshot ?? undefined,
      variantSnapshot: item.variantSnapshot ?? undefined,
    })),
  };
}
