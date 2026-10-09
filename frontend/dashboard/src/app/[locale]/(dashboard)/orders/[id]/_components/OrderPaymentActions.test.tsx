import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@findeg/orders';
import type { OrderStatus, PaymentStatus } from '@findeg/orders/schemas';

const { updateOrderStatusAction, updateOrderPaymentStatusAction, toast } = vi.hoisted(() => ({
  updateOrderStatusAction: vi.fn(),
  updateOrderPaymentStatusAction: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@data/orders/actions', () => ({
  updateOrderStatusAction,
  updateOrderPaymentStatusAction,
}));
vi.mock('@i18n/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@hooks/use-toast', () => ({ useToast: () => ({ toast }) }));

import { OrderPaymentFulfillment } from './OrderPaymentFulfillment';

function order(status: OrderStatus, paymentStatus: PaymentStatus, trackingNumber?: string): Order {
  return {
    id: 7,
    status,
    paymentStatus,
    trackingNumber,
    createdAt: new Date('2026-10-05T08:00:00.000Z'),
  } as Order;
}

describe('Order payment actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks an unpaid Order paid and confirms with a toast', async () => {
    updateOrderPaymentStatusAction.mockResolvedValue({ success: true });
    render(<OrderPaymentFulfillment order={order('pending', 'unpaid')} />);

    fireEvent.click(screen.getByRole('button', { name: /mark as paid/i }));

    expect(updateOrderPaymentStatusAction).toHaveBeenCalledWith(7, 'paid');
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Payment status updated' }),
      ),
    );
  });

  it('offers no payment action once the payment is refunded', () => {
    render(<OrderPaymentFulfillment order={order('delivered', 'refunded')} />);
    expect(screen.queryByRole('button', { name: /mark as/i })).not.toBeInTheDocument();
  });

  it('shows the server refusal when a payment update is rejected', async () => {
    updateOrderPaymentStatusAction.mockResolvedValue({
      success: false,
      error: 'Not authorized to change orders',
    });
    render(<OrderPaymentFulfillment order={order('pending', 'unpaid')} />);

    fireEvent.click(screen.getByRole('button', { name: /mark as paid/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Update failed',
          description: 'Not authorized to change orders',
          variant: 'destructive',
        }),
      ),
    );
  });

  it('reports a failed payment request instead of throwing when the server action rejects', async () => {
    updateOrderPaymentStatusAction.mockRejectedValue(new Error('Failed to fetch'));
    render(<OrderPaymentFulfillment order={order('pending', 'unpaid')} />);

    fireEvent.click(screen.getByRole('button', { name: /mark as paid/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Update failed', variant: 'destructive' }),
      ),
    );
  });

  it('reports a failed tracking request instead of throwing when the server action rejects', async () => {
    updateOrderStatusAction.mockRejectedValue(new Error('Failed to fetch'));
    render(<OrderPaymentFulfillment order={order('processing', 'paid')} />);

    fireEvent.change(screen.getByPlaceholderText(/tracking/i), { target: { value: 'TRK-1' } });
    fireEvent.click(screen.getByRole('button', { name: /^update$/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Update failed', variant: 'destructive' }),
      ),
    );
  });
});
