import React from 'react';
import { orderQueries } from '@findeg/db/queries';
import { DEFAULT_LOCALE } from '../../core/domain/value-objects';
import OrderStatusUpdateEmail from '../../notifications/infrastructure/templates/OrderStatusUpdateEmail';
import { isNotifiedOrderStatus, type OutboxHandler } from '../domain/types';
import type { EmailProvider } from './EmailProvider';

const SUBJECTS = {
  shipped: { en: 'has shipped', ar: 'تم شحنه' },
  delivered: { en: 'was delivered', ar: 'تم توصيله' },
  cancelled: { en: 'was cancelled', ar: 'تم إلغاؤه' },
} as const;

/** Renders the status email at send time; the payload carries only `{ orderId, status }`. */
export function createOrderStatusHandler(emailProvider: EmailProvider): OutboxHandler {
  return async (payload, { rowId }) => {
    const orderId = Number(payload.orderId);
    const status = String(payload.status);
    if (!isNotifiedOrderStatus(status)) throw new Error(`Unsupported order status "${status}"`);
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
        locale,
      }),
      idempotencyKey: rowId,
    });
    return 'delivered';
  };
}
