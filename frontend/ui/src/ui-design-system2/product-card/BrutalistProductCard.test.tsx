import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrutalistProductCard } from './BrutalistProductCard';
import type { SupplyItem } from '../state/types';

const mockItem: SupplyItem = {
  id: 'b5-journal',
  index: '01',
  title: 'B5 DOT-GRID JOURNAL',
  category: 'PAPER',
  badge: 'CORE ESSENTIAL',
  price: 14.0,
  specs: '192P • 160GSM IVORY • LAY-FLAT',
  tracks: ['highschool', 'stem', 'studio'],
  svgType: 'journal',
};

describe('BrutalistProductCard', () => {
  it('renders item metadata correctly', () => {
    render(<BrutalistProductCard item={mockItem} />);

    expect(screen.getByText('01')).toBeDefined();
    expect(screen.getByText('CORE ESSENTIAL')).toBeDefined();
    expect(screen.getByText('B5 DOT-GRID JOURNAL')).toBeDefined();
    expect(screen.getByText('192P • 160GSM IVORY • LAY-FLAT')).toBeDefined();
    expect(screen.getByText('$14.00')).toBeDefined();
    expect(screen.getByText('+ ADD TO SUPPLY LIST')).toBeDefined();
    expect(screen.getByText('HAVE IT?')).toBeDefined();
  });

  it('triggers onQuantityChange(1) when + ADD TO SUPPLY LIST is clicked', () => {
    const onQuantityChange = vi.fn();
    render(<BrutalistProductCard item={mockItem} onQuantityChange={onQuantityChange} />);

    fireEvent.click(screen.getByText('+ ADD TO SUPPLY LIST'));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it('renders stepper and triggers increment/decrement when quantity > 0', () => {
    const onQuantityChange = vi.fn();
    render(
      <BrutalistProductCard item={mockItem} quantity={3} onQuantityChange={onQuantityChange} />,
    );

    expect(screen.getByText(/IN LIST: 3/)).toBeDefined();

    const decrementBtn = screen.getByRole('button', { name: '−' });
    const incrementBtn = screen.getByRole('button', { name: '+' });

    fireEvent.click(decrementBtn);
    expect(onQuantityChange).toHaveBeenCalledWith(-1);

    fireEvent.click(incrementBtn);
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it('renders owned state and triggers onToggleOwned', () => {
    const onToggleOwned = vi.fn();
    const { rerender } = render(
      <BrutalistProductCard item={mockItem} isOwned={false} onToggleOwned={onToggleOwned} />,
    );

    const toggleBtn = screen.getByRole('button', { name: 'HAVE IT?' });
    fireEvent.click(toggleBtn);
    expect(onToggleOwned).toHaveBeenCalledTimes(1);

    rerender(
      <BrutalistProductCard
        item={mockItem}
        quantity={2}
        isOwned={true}
        onToggleOwned={onToggleOwned}
      />,
    );

    expect(screen.getByText('✓ OWNED')).toBeDefined();
    expect(screen.getByText(/IN LIST: 2 \(OWNED\)/)).toBeDefined();
  });
});
