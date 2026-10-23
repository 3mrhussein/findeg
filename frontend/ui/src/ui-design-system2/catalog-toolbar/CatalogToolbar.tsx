'use client';

import React, { useEffect, useState } from 'react';
import type { SortMode } from '../state/types';

export interface CatalogToolbarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortMode: SortMode;
  onSortModeChange: (sortMode: SortMode) => void;
  className?: string;
}

const CATEGORIES = ['ALL', 'PAPER', 'WRITING', 'DRAFTING'] as const;

export const CatalogToolbar: React.FC<CatalogToolbarProps> = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortMode,
  onSortModeChange,
  className = '',
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange(value);
  };

  return (
    <div
      data-testid="catalog-toolbar"
      className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border border-[#181816] bg-[#EAE7DF] font-mono text-xs ${className}`}
    >
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5" role="tablist">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 uppercase font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#141413] text-[#F6F4EE]'
                  : 'bg-transparent border border-[#181816]/30 hover:border-[#181816] text-[#141413]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Monospace Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="SEARCH CATALOG [TITLE / SPECS]..."
            className="w-full px-3 py-1.5 border border-[#181816] bg-white text-[#141413] placeholder:text-[#141413]/40 focus:outline-none focus:ring-1 focus:ring-[#181816]"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#141413]/60 hover:text-[#141413] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="catalog-sort"
            className="text-[10px] uppercase font-bold text-[#141413]/70 shrink-0"
          >
            SORT:
          </label>
          <select
            id="catalog-sort"
            value={sortMode}
            onChange={(e) => onSortModeChange(e.target.value as SortMode)}
            className="px-2.5 py-1.5 border border-[#181816] bg-white text-[#141413] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#181816] cursor-pointer"
          >
            <option value="featured">FEATURED (CURATED)</option>
            <option value="price-asc">PRICE: LOW → HIGH</option>
            <option value="price-desc">PRICE: HIGH → LOW</option>
          </select>
        </div>
      </div>
    </div>
  );
};
