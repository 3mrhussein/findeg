import React from 'react';
import { orderQueries } from '@findeg/db/queries';
import { moneyFromDecimal, moneyToDecimal } from '@findeg/domain';
import { DEFAULT_LOCALE } from '../../core';
import { OrderConfirmationEmail } from '../../notifications';
import type { OutboxHandler } from '../domain/types';
import type { EmailProvider } from './EmailProvider';

/** Exact `xx.xx` text from a stored decimal, validated by the domain and never a float. */
const exactDecimal = (stored: string | null | undefined) =>
  moneyToDecimal(moneyFromDecimal(stored ?? '0'));

/**
 * Currency text for a stored decimal, with exactly two decimals. Whole pounds come from Intl as a
 * bigint; the fraction is inserted after the last integer digit, so no float is ever used.
 */
const formatCurrency = (amount: string, currency: string, locale: string): string => {
  const numberLocale = locale === 'ar' ? 'ar-EG' : 'en-EG';
  const piasters = moneyFromDecimal(amount) as bigint;
  const parts = new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(piasters / 100n);
  const separator = new Intl.NumberFormat(numberLocale)
    .formatToParts(1.5)
    .find((part) => part.type === 'decimal')!.value;
  const cents = new Intl.NumberFormat(numberLocale, {
    useGrouping: false,
    minimumIntegerDigits: 2,
  }).format(piasters % 100n);
  const lastInteger = parts.map((part) => part.type).lastIndexOf('integer');
  return parts
    .map((part, index) =>
      index === lastInteger ? `${part.value}${separator}${cents}` : part.value,
    )
    .join('');
};

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
        price: formatCurrency(exactDecimal(item.totalPrice), order.currency, locale),
      })),
      total: formatCurrency(exactDecimal(order.totalAmount), order.currency, locale),
      deliveryAddress: [address?.street, address?.area, address?.city].filter(Boolean).join(', '),
      locale,
      isGuest: !order.userId,
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
