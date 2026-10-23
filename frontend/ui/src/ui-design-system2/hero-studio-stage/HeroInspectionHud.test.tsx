import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HeroInspectionHud } from './HeroInspectionHud';

describe('HeroInspectionHud', () => {
  it('renders journal details when activeItem is journal', () => {
    const onSelectItem = vi.fn();
    const onAddItem = vi.fn();

    render(
      <HeroInspectionHud activeItem="journal" onSelectItem={onSelectItem} onAddItem={onAddItem} />,
    );

    expect(screen.getByText('B5 DOT-GRID JOURNAL')).toBeDefined();
    expect(screen.getByText('$14.00')).toBeDefined();
    expect(screen.getByText('// IN THE BACKPACK')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /PEN CUP/i }));
    expect(onSelectItem).toHaveBeenCalledWith('pencup');

    fireEvent.click(screen.getByRole('button', { name: /\+ ADD TO SUPPLY LIST/i }));
    expect(onAddItem).toHaveBeenCalledWith('journal');
  });

  it('renders pen cup details when activeItem is pencup', () => {
    const onSelectItem = vi.fn();
    const onAddItem = vi.fn();

    render(
      <HeroInspectionHud activeItem="pencup" onSelectItem={onSelectItem} onAddItem={onAddItem} />,
    );

    expect(screen.getByText('0.5MM GEL PEN & SCALE SET')).toBeDefined();
    expect(screen.getByText('$12.50')).toBeDefined();
    expect(screen.getByText('// ON THE DESK')).toBeDefined();
  });
});
