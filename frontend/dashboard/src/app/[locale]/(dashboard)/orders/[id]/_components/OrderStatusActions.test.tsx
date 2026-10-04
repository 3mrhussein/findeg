import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Order } from '@findeg/backend/features/order';
import type { OrderStatus, PaymentStatus } from '@findeg/backend/features/core';

vi.mock('@actions/order-actions', () => ({ updateOrderStatusAction: vi.fn() }));
vi.mock('@hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

import { OrderHeader } from './OrderHeader';
import { OrderPaymentFulfillment } from './OrderPaymentFulfillment';

function order(status: OrderStatus, paymentStatus: PaymentStatus = 'unpaid'): Order {
  return { id: 7, status, paymentStatus, createdAt: new Date('2026-10-05T08:00:00.000Z') } as Order;
}

const cancelHint = /only once the parcel is back in the warehouse/i;

describe('Order status actions', () => {
  it('warns Staff to cancel a shipped Order only once the parcel is back', () => {
    render(<OrderPaymentFulfillment order={order('shipped')} />);
    expect(screen.getByText(cancelHint)).toBeInTheDocument();
  });

  it('shows no return warning before the Order ships', () => {
    render(<OrderPaymentFulfillment order={order('processing')} />);
    expect(screen.queryByText(cancelHint)).not.toBeInTheDocument();
  });

  it.each(['processing', 'shipped'] as const)('offers no refund for a paid %s Order', (status) => {
    render(<OrderHeader order={order(status, 'paid')} />);
    expect(screen.queryByRole('button', { name: /refund/i })).not.toBeInTheDocument();
  });

  it('offers a refund for a paid delivered Order', () => {
    render(<OrderHeader order={order('delivered', 'paid')} />);
    expect(screen.getByRole('button', { name: /refund/i })).toBeInTheDocument();
  });
});
