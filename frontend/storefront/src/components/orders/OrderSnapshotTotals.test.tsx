import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderSnapshotTotals } from './OrderSnapshotTotals';

describe('Customer Order snapshot totals', () => {
  it('shows gross subtotal and the discount separately without subtracting it twice', () => {
    render(
      <OrderSnapshotTotals
        subtotal={3500n}
        discountTotal={250n}
        shippingCost={1000n}
        totalAmount={4500n}
        currency="EGP"
        labels={{
          subtotal: 'Subtotal',
          discount: 'Discount',
          shipping: 'Shipping',
          total: 'Total',
        }}
      />,
    );
    expect(screen.getByTestId('order-gross-subtotal')).toHaveTextContent('EGP 37.50');
    expect(screen.getByTestId('order-discount-total')).toHaveTextContent('EGP 2.50');
    expect(screen.getByTestId('order-total')).toHaveTextContent('EGP 45.00');
  });
});
