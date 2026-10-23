import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  ThermalReceipt,
  DEFAULT_CATALOG_ITEMS,
  calculateSupplyTotals,
} from '@findeg/ui/ui-design-system2';

describe('Dashboard Packing Ticket Preview DS2 Integration', () => {
  it('imports UI Design System 2 components and renders thermal packing ticket preview in dashboard', () => {
    const packingEntries = {
      [DEFAULT_CATALOG_ITEMS[0].id]: {
        id: DEFAULT_CATALOG_ITEMS[0].id,
        title: DEFAULT_CATALOG_ITEMS[0].title,
        price: DEFAULT_CATALOG_ITEMS[0].price,
        qty: 2,
        owned: false,
      },
      [DEFAULT_CATALOG_ITEMS[1].id]: {
        id: DEFAULT_CATALOG_ITEMS[1].id,
        title: DEFAULT_CATALOG_ITEMS[1].title,
        price: DEFAULT_CATALOG_ITEMS[1].price,
        qty: 1,
        owned: true,
      },
    };

    const totals = calculateSupplyTotals(packingEntries, true);
    expect(totals.totalQty).toBe(3);

    render(<ThermalReceipt items={packingEntries} totals={totals} eduDiscountActive={true} />);

    expect(screen.getByTestId('thermal-receipt')).toBeDefined();
    expect(screen.getByText(DEFAULT_CATALOG_ITEMS[0].title)).toBeDefined();
    expect(screen.getByText(DEFAULT_CATALOG_ITEMS[1].title)).toBeDefined();
    expect(screen.getByText(/STUDENT \.EDU DISCOUNT/i)).toBeDefined();
  });
});
