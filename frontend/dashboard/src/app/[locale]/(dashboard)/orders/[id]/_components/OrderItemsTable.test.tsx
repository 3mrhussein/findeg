import { NextIntlClientProvider } from 'next-intl';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { OrderItem } from '@findeg/orders';
import { OrderItemsTable } from './OrderItemsTable';

describe('Staff Order line snapshots', () => {
  it('shows historical name, unit price, line discount and accepted line total', () => {
    render(
      <NextIntlClientProvider locale="en" messages={{ Common: { Discount: 'Discount' } }}>
        <OrderItemsTable
          currency="EGP"
          items={[
            {
              id: 1,
              productId: null,
              productNameSnapshot: 'Historical Notebook',
              quantity: 3,
              unitPrice: 1250n,
              discountAmount: 250n,
              lineTotal: 3500n,
            } as OrderItem,
          ]}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Historical Notebook')).toBeInTheDocument();
    expect(screen.getByText('EGP 12.50')).toBeInTheDocument();
    expect(screen.getByText('EGP 2.50')).toBeInTheDocument();
    expect(screen.getByText('EGP 35.00')).toBeInTheDocument();
  });
});
