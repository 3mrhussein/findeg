import type { OrderStatus, Locale } from '@findeg/domain';
import React from 'react';
import { OrderStatusSchema } from '@findeg/orders';
import { orderQueries } from '@findeg/db/queries';
import { DEFAULT_LOCALE } from '../../core';
import { OrderStatusUpdateEmail } from '../../notifications';
import { isNotifiedOrderStatus, type OutboxHandler } from '../domain/types';
import type { EmailProvider } from './EmailProvider';

const SUBJECTS = {
  shipped: { en: 'has shipped', ar: 'تم شحنه' } satisfies Record<Locale, string | undefined>,
  delivered: { en: 'was delivered', ar: 'تم توصيله' } satisfies Record<Locale, string | undefined>,
  cancelled: { en: 'was cancelled', ar: 'تم إلغاؤه' } satisfies Record<Locale, string | undefined>,
  pending: null,
  confirmed: null,
  processing: null,
  refunded: null,
} satisfies Record<OrderStatus, Record<Locale, string> | null>;

/** Renders the status email at send time; the payload carries only `{ orderId, status }`. */
export function createOrderStatusHandler(emailProvider: EmailProvider): OutboxHandler {
  return async (payload, { rowId }) => {
    const orderId = Number(payload.orderId);
    const parsed = OrderStatusSchema.safeParse(payload.status);
    if (!parsed.success || !isNotifiedOrderStatus(parsed.data))
      throw new Error(`Unsupported order status "${String(payload.status)}"`);
    const status = parsed.data;
    const found = Number.isInteger(orderId) ? await orderQueries.getById(orderId) : null;
    if (!found) throw new Error(`Order ${String(payload.orderId)} not found`);

    const { order } = found;
    if (!order.customerEmail) throw new Error(`Order ${order.orderReference} has no email`);

    const locale = DEFAULT_LOCALE;
    await emailProvider.send({
      to: order.customerEmail,
      subject:
        locale === 'ar'
          ? `طلبك ${order.orderReference} ${SUBJECTS[status].ar}`
          : `Your order ${order.orderReference} ${SUBJECTS[status].en}`,
      react: React.createElement(OrderStatusUpdateEmail, {
        orderId: order.orderReference,
        customerName: order.customerName || 'Customer',
        newStatus: status,
        trackingNumber: order.trackingNumber ?? undefined,
        // Account orders are keyed by id; guests land on their reference page (or the lookup form).
        orderPath: order.userId
          ? `/my-account/orders/${order.id}`
          : `/guest-orders/${encodeURIComponent(order.orderReference)}`,
        locale,
      }),
      idempotencyKey: rowId,
    });
    return 'delivered';
  };
}
