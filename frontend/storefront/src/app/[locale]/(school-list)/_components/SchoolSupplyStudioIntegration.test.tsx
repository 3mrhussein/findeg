import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  DEFAULT_CATALOG_ITEMS,
  ThermalReceipt,
  calculateSupplyTotals,
} from '@findeg/ui/ui-design-system2';

describe('Storefront School Supply Studio DS2 Integration', () => {
  it('imports UI Design System 2 components and computes totals in storefront', () => {
    expect(DEFAULT_CATALOG_ITEMS.length).toBe(8);

    const initialEntries = {
      [DEFAULT_CATALOG_ITEMS[0].id]: {
        id: DEFAULT_CATALOG_ITEMS[0].id,
        title: DEFAULT_CATALOG_ITEMS[0].title,
        price: DEFAULT_CATALOG_ITEMS[0].price,
        qty: 1,
        owned: false,
      },
    };

    const totals = calculateSupplyTotals(initialEntries, false);
    expect(totals.totalQty).toBe(1);
    expect(totals.grossSubtotal).toBe(DEFAULT_CATALOG_ITEMS[0].price);

    render(<ThermalReceipt items={initialEntries} totals={totals} eduDiscountActive={false} />);

    expect(screen.getByTestId('thermal-receipt')).toBeDefined();
    expect(screen.getByText(DEFAULT_CATALOG_ITEMS[0].title)).toBeDefined();
  });
});
