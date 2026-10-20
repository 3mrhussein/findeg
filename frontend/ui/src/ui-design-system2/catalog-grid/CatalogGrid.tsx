'use client';

import React from 'react';
import type { SupplyItem, SupplyListEntry } from '../state/types';
import { BrutalistProductCard } from '../product-card/BrutalistProductCard';

export interface CatalogGridProps {
  products: SupplyItem[];
  itemsState: Record<string, SupplyListEntry>;
  onQuantityChange: (itemId: string, delta: number) => void;
  onToggleOwned: (itemId: string) => void;
  currencySymbol?: string;
  onResetFilters?: () => void;
  emptySearchQuery?: string;
  className?: string;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  products,
  itemsState,
  onQuantityChange,
  onToggleOwned,
  currencySymbol = '$',
  onResetFilters,
  emptySearchQuery = '',
  className = '',
}) => {
  if (products.length === 0) {
    return (
      <div
        data-testid="catalog-grid-empty"
        className="p-12 text-center border border-[#181816] bg-[#F6F4EC] font-mono text-xs uppercase"
      >
        NO STATIONERY ITEMS MATCH "{emptySearchQuery}".
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="underline text-[#E07A38] font-bold ml-2 cursor-pointer"
          >
            RESET FILTERS
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="catalog-grid"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {products.map((item) => {
        const entry = itemsState[item.id];
        const qty = entry ? entry.qty : 0;
        const owned = entry ? entry.owned : false;

        return (
          <BrutalistProductCard
            key={item.id}
            item={item}
            quantity={qty}
            isOwned={owned}
            currencySymbol={currencySymbol}
            onQuantityChange={(delta) => onQuantityChange(item.id, delta)}
            onToggleOwned={() => onToggleOwned(item.id)}
          />
        );
      })}
    </div>
  );
};
