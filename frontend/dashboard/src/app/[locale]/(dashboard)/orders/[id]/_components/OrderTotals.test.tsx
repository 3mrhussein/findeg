import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Order } from '@findeg/orders';
import { OrderTotals } from './OrderTotals';

describe('Staff Order snapshot totals', () => {
  it('shows gross subtotal, shipping, discount and accepted total exactly', () => {
    render(
      <OrderTotals
        order={
          {
            subtotal: 3750n,
            shippingCost: 1000n,
            discountTotal: 250n,
            totalAmount: 4500n,
            currency: 'EGP',
          } as Order
        }
      />,
    );
    expect(screen.getByText('EGP 37.50')).toBeInTheDocument();
    expect(screen.getByText('EGP 10.00')).toBeInTheDocument();
    expect(screen.getByText('-EGP 2.50')).toBeInTheDocument();
    expect(screen.getByText('EGP 45.00')).toBeInTheDocument();
  });
});
