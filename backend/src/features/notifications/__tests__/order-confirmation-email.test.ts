import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OrderConfirmationEmail } from '../infrastructure/templates/OrderConfirmationEmail';

describe('Order confirmation email', () => {
  it('links guests to order lookup with reference query param', () => {
    const html = renderToStaticMarkup(
      createElement(OrderConfirmationEmail, {
        orderReference: 'FE-GUEST123',
        customerName: 'Guest User',
        items: [{ name: 'Notebook', quantity: 2, price: 'EGP 50.00' }],
        total: 'EGP 150.00',
        deliveryAddress: 'Cairo',
        locale: 'en',
        isGuest: true,
      }),
    );
    expect(html).toContain('/en/order-lookup?ref=FE-GUEST123');
  });

  it('links registered users to my-account/orders', () => {
    const html = renderToStaticMarkup(
      createElement(OrderConfirmationEmail, {
        orderReference: 'FE-REG123',
        customerName: 'Registered User',
        items: [{ name: 'Notebook', quantity: 1, price: 'EGP 25.00' }],
        total: 'EGP 75.00',
        deliveryAddress: 'Giza',
        locale: 'ar',
        isGuest: false,
      }),
    );
    expect(html).toContain('/ar/my-account/orders');
    expect(html).toContain('dir="rtl"');
  });
});
