import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CatalogGrid } from './CatalogGrid';
import { PRODUCTS } from '../state/catalog-data';
import type { SupplyListEntry } from '../state/types';

describe('CatalogGrid', () => {
  it('renders all product cards in the grid', () => {
    const itemsState: Record<string, SupplyListEntry> = {};
    render(
      <CatalogGrid
        products={PRODUCTS}
        itemsState={itemsState}
        onQuantityChange={vi.fn()}
        onToggleOwned={vi.fn()}
      />,
    );

    expect(screen.getByText('B5 DOT-GRID JOURNAL')).toBeDefined();
    expect(screen.getByText('0.5MM GEL PEN 6-PACK')).toBeDefined();
    expect(screen.getByText('GRAPHING SCIENTIFIC CALC')).toBeDefined();
  });

  it('renders empty search state when no products match', () => {
    const onResetFilters = vi.fn();
    render(
      <CatalogGrid
        products={[]}
        itemsState={{}}
        emptySearchQuery="xyznonexistent"
        onResetFilters={onResetFilters}
        onQuantityChange={vi.fn()}
        onToggleOwned={vi.fn()}
      />,
    );

    expect(screen.getByText(/NO STATIONERY ITEMS MATCH "xyznonexistent"/)).toBeDefined();

    const resetBtn = screen.getByRole('button', { name: 'RESET FILTERS' });
    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
