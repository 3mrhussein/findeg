import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardOrdersWidget } from './DashboardOrdersWidget';

const labels = {
  revenue: 'Total Revenue',
  orders: 'Total Orders',
  distribution: 'Order Status',
  recent: 'Recent Orders',
  viewAll: 'View all orders',
  empty: 'No Orders',
  reference: 'Order',
  total: 'Total',
  status: 'Status',
  statuses: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  },
};

describe('Dashboard home Orders', () => {
  it('renders exact accepted revenue, every status including zero counts, and recent Order links', () => {
    render(
      <DashboardOrdersWidget
        locale="ar"
        labels={labels}
        stats={{
          currency: 'EGP',
          totalOrders: 3,
          totalRevenue: 9007199254740993123n,
          ordersByStatus: {
            pending: 2,
            confirmed: 1,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            refunded: 0,
          },
        }}
        recentOrders={[
          { id: 42, orderReference: 'FE-ABC123', status: 'confirmed', totalAmount: 3750n },
        ]}
      />,
    );
    expect(screen.getByTestId('dashboard-orders-revenue')).toHaveTextContent(
      'EGP 90071992547409931.23',
    );
    expect(screen.getByTestId('dashboard-orders-count')).toHaveTextContent('3');
    expect(screen.getAllByTestId(/^dashboard-order-status-/)).toHaveLength(7);
    expect(screen.getByTestId('dashboard-order-status-pending')).toHaveTextContent('Pending2');
    expect(screen.getByTestId('dashboard-order-status-shipped')).toHaveTextContent('Shipped0');
    expect(screen.getByRole('link', { name: 'FE-ABC123' })).toHaveAttribute(
      'href',
      '/ar/orders/42',
    );
    const row = screen.getByRole('row', { name: /FE-ABC123/ });
    expect(within(row).getByText('EGP 37.50')).toBeVisible();
    expect(within(row).getByText('Confirmed')).toBeVisible();
  });
});
