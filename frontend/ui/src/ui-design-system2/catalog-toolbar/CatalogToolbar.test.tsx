import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CatalogToolbar } from './CatalogToolbar';
import type { SortMode } from '../state/types';

describe('CatalogToolbar', () => {
  it('renders category tabs and triggers onCategoryChange', () => {
    const onCategoryChange = vi.fn();
    render(
      <CatalogToolbar
        activeCategory="ALL"
        onCategoryChange={onCategoryChange}
        searchQuery=""
        onSearchChange={vi.fn()}
        sortMode="featured"
        onSortModeChange={vi.fn()}
      />,
    );

    const paperTab = screen.getByRole('button', { name: 'PAPER' });
    const writingTab = screen.getByRole('button', { name: 'WRITING' });
    const draftingTab = screen.getByRole('button', { name: 'DRAFTING' });

    expect(paperTab).toBeDefined();
    expect(writingTab).toBeDefined();
    expect(draftingTab).toBeDefined();

    fireEvent.click(writingTab);
    expect(onCategoryChange).toHaveBeenCalledWith('WRITING');
  });

  it('handles search input changes', () => {
    const onSearchChange = vi.fn();
    render(
      <CatalogToolbar
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        searchQuery=""
        onSearchChange={onSearchChange}
        sortMode="featured"
        onSortModeChange={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/SEARCH CATALOG/i);
    fireEvent.change(input, { target: { value: 'journal' } });
    expect(onSearchChange).toHaveBeenCalledWith('journal');
  });

  it('handles sort mode select change', () => {
    const onSortModeChange = vi.fn();
    render(
      <CatalogToolbar
        activeCategory="ALL"
        onCategoryChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        sortMode="featured"
        onSortModeChange={onSortModeChange}
      />,
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'price-desc' as SortMode } });
    expect(onSortModeChange).toHaveBeenCalledWith('price-desc');
  });
});
