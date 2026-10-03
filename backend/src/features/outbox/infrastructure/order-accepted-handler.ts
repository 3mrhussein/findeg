import React from 'react';
import { orderQueries } from '@findeg/db/queries';
import { DEFAULT_LOCALE } from '../../core/domain/value-objects';
import OrderConfirmationEmail from '../../notifications/infrastructure/templates/OrderConfirmationEmail';
import type { OutboxHandler } from '../domain/types';
import type { EmailProvider } from './EmailProvider';

const formatCurrency = (amount: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency,
  }).format(amount);

/** Renders the confirmation at send time from the Order; the payload carries only `{ orderId }`. */
export function createOrderAcceptedHandler(emailProvider: EmailProvider): OutboxHandler {
  return async (payload, { rowId }) => {
    const orderId = Number(payload.orderId);
    const found = Number.isInteger(orderId) ? await orderQueries.getById(orderId) : null;
    if (!found) throw new Error(`Order ${String(payload.orderId)} not found`);

    const { order, items } = found;
    if (!order.customerEmail) throw new Error(`Order ${order.orderReference} has no email`);

    const locale = DEFAULT_LOCALE;
    const address = order.shippingAddressSnapshot;
    const react = React.createElement(OrderConfirmationEmail, {
      orderReference: order.orderReference,
      customerName: order.customerName || 'Customer',
      items: items.map((item) => ({
        name: item.productNameSnapshot || '',
        quantity: item.quantity,
        price: formatCurrency(Number(item.totalPrice ?? 0), order.currency, locale),
      })),
      total: formatCurrency(Number(order.totalAmount), order.currency, locale),
      deliveryAddress: [address?.street, address?.area, address?.city].filter(Boolean).join(', '),
      locale,
    });

    await emailProvider.send({
      to: order.customerEmail,
      subject:
        locale === 'ar'
          ? `تأكيد طلبك ${order.orderReference}`
          : `Order Confirmation ${order.orderReference}`,
      react,
      idempotencyKey: rowId,
    });
    return 'delivered';
  };
}
