import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { OrderStatus } from '@findeg/domain/types';
import { OrderStatusUpdateEmail } from '../infrastructure/templates/OrderStatusUpdateEmail';

const labels: [OrderStatus, string, string][] = [
  ['pending', 'Pending', 'قيد الانتظار'],
  ['confirmed', 'Confirmed', 'تم التأكيد'],
  ['processing', 'Processing', 'قيد التجهيز'],
  ['shipped', 'Shipped', 'تم الشحن'],
  ['delivered', 'Delivered', 'تم التوصيل'],
  ['cancelled', 'Cancelled', 'تم الإلغاء'],
  ['refunded', 'Refunded', 'تم رد المبلغ'],
];

describe.each(['en', 'ar'] as const)('Order status email in %s', (locale) => {
  it.each(labels)('renders the %s label', (newStatus, en, ar) => {
    const html = renderToStaticMarkup(
      createElement(OrderStatusUpdateEmail, {
        orderId: 'FE-000001',
        customerName: 'Customer',
        newStatus,
        locale,
      }),
    );
    expect(html).toContain(locale === 'en' ? en : ar);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(locale === 'ar' ? 'dir="rtl"' : 'dir="ltr"');
  });
});
