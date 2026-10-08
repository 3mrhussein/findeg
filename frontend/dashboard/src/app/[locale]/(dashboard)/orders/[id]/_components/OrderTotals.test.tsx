import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Order } from '@findeg/backend/features/order';
import { OrderTotals } from './OrderTotals';

describe('Order totals display', () => {
  it('shows gross subtotal before the discount and the charged total including shipping', () => {
    const order: Order = {
      id: 1,
      orderReference: 'FE-TEST01',
      status: 'pending',
      paymentStatus: 'unpaid',
      subtotal: 1500n,
      discountTotal: 500n,
      shippingCost: 200n,
      totalAmount: 1700n,
      currency: 'EGP',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };
    render(<OrderTotals order={order} />);
    expect(screen.getByText('EGP 20.00')).toBeInTheDocument();
    expect(screen.getByText('-EGP 5.00')).toBeInTheDocument();
    expect(screen.getByText('EGP 2.00')).toBeInTheDocument();
    expect(screen.getByText('EGP 17.00')).toBeInTheDocument();
  });
});
