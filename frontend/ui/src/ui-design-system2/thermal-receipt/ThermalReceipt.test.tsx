import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThermalReceipt } from './ThermalReceipt';
import type { SupplyListEntry, SupplyTotals } from '../state/types';

describe('ThermalReceipt', () => {
  const mockItems: Record<string, SupplyListEntry> = {
    'b5-journal': {
      id: 'b5-journal',
      title: 'B5 DOT-GRID JOURNAL',
      price: 14.0,
      qty: 1,
      owned: false,
    },
    'scale-ruler': {
      id: 'scale-ruler',
      title: 'ALUMINUM SCALE RULER',
      price: 8.5,
      qty: 1,
      owned: true,
    },
  };

  const mockTotals: SupplyTotals = {
    totalQty: 2,
    grossSubtotal: 22.5,
    ownedDeduction: 8.5,
    netBeforeDiscount: 14.0,
    eduDiscount: 2.1,
    finalTotal: 11.9,
  };

  it('renders dispenser housing with ONLINE status', () => {
    render(
      <ThermalReceipt
        items={mockItems}
        totals={mockTotals}
        activeTrackLabel="HIGH SCHOOL CORE"
        eduDiscountActive={true}
        onQuantityChange={vi.fn()}
        onToggleOwned={vi.fn()}
      />,
    );

    expect(screen.getByText(/ONLINE/i)).toBeDefined();
    expect(screen.getByText(/HIGH SCHOOL CORE/i)).toBeDefined();
  });

  it('renders itemized items with owned item struck through', () => {
    render(
      <ThermalReceipt
        items={mockItems}
        totals={mockTotals}
        activeTrackLabel="HIGH SCHOOL CORE"
        eduDiscountActive={true}
        onQuantityChange={vi.fn()}
        onToggleOwned={vi.fn()}
      />,
    );

    expect(screen.getByText('B5 DOT-GRID JOURNAL')).toBeDefined();
    const rulerTitle = screen.getByText('ALUMINUM SCALE RULER');
    expect(rulerTitle.className).toContain('line-through');
    expect(screen.getByText('OWNED ($0)')).toBeDefined();
  });

  it('displays accurate totals breakdown', () => {
    render(
      <ThermalReceipt
        items={mockItems}
        totals={mockTotals}
        activeTrackLabel="HIGH SCHOOL CORE"
        eduDiscountActive={true}
        onQuantityChange={vi.fn()}
        onToggleOwned={vi.fn()}
      />,
    );

    expect(screen.getByText('$22.50')).toBeDefined(); // Gross Subtotal
    expect(screen.getByText('-$8.50')).toBeDefined(); // Owned Deduction
    expect(screen.getByText('-$2.10')).toBeDefined(); // 15% EDU discount
    expect(screen.getByText('$11.90')).toBeDefined(); // Final Total
  });

  it('triggers action buttons (Order Now, Copy List, Reset)', () => {
    const onOrderNow = vi.fn();
    const onCopyList = vi.fn();
    const onResetList = vi.fn();

    render(
      <ThermalReceipt
        items={mockItems}
        totals={mockTotals}
        activeTrackLabel="HIGH SCHOOL CORE"
        eduDiscountActive={true}
        onQuantityChange={vi.fn()}
        onToggleOwned={vi.fn()}
        onOrderNow={onOrderNow}
        onCopyList={onCopyList}
        onResetList={onResetList}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /ORDER PACK NOW/i }));
    expect(onOrderNow).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /COPY LIST/i }));
    expect(onCopyList).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /RESET/i }));
    expect(onResetList).toHaveBeenCalledTimes(1);
  });
});
