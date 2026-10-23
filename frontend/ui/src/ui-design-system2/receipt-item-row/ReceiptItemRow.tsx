'use client';

import React from 'react';
import type { SupplyListEntry } from '../state/types';

export interface ReceiptItemRowProps {
  item: SupplyListEntry;
  currencySymbol?: string;
  onQuantityChange?: (delta: number) => void;
  onToggleOwned?: () => void;
  className?: string;
}

export const ReceiptItemRow: React.FC<ReceiptItemRowProps> = ({
  item,
  currencySymbol = '$',
  onQuantityChange,
  onToggleOwned,
  className = '',
}) => {
  const lineTotal = item.price * item.qty;

  return (
    <div
      data-testid={`receipt-row-${item.id}`}
      className={`flex items-start justify-between gap-2 text-[11px] py-1.5 border-b border-[#141413]/10 last:border-b-0 font-mono ${className}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onToggleOwned}
          className={`mt-0.5 px-1.5 py-0.5 text-[9px] font-bold border border-[#141413] transition-colors cursor-pointer ${
            item.owned
              ? 'bg-[#141413] text-[#C9F24B]'
              : 'bg-white text-[#141413] hover:bg-[#141413] hover:text-white'
          }`}
          title="Toggle if you already own this item at home"
          aria-pressed={item.owned}
        >
          {item.owned ? '✓ HAVE' : 'BUY'}
        </button>
        <div>
          <div
            className={`font-bold uppercase tracking-tight ${
              item.owned ? 'line-through text-[#141413]/50' : 'text-[#141413]'
            }`}
          >
            {item.title}
          </div>
          <div className="text-[10px] text-[#141413]/65 flex items-center gap-2 mt-0.5">
            <span>
              {currencySymbol}
              {item.price.toFixed(2)} EA
            </span>
            <span className="inline-flex items-center border border-[#141413]/30 bg-white">
              <button
                type="button"
                aria-label={`Decrease ${item.title}`}
                onClick={() => onQuantityChange?.(-1)}
                className="px-1.5 hover:bg-[#141413] hover:text-white transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="px-1.5 font-bold">{item.qty}</span>
              <button
                type="button"
                aria-label={`Increase ${item.title}`}
                onClick={() => onQuantityChange?.(1)}
                className="px-1.5 hover:bg-[#141413] hover:text-white transition-colors cursor-pointer"
              >
                +
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className="text-right font-bold shrink-0">
        {item.owned ? (
          <span className="text-[10px] text-emerald-800 uppercase font-extrabold">OWNED ($0)</span>
        ) : (
          <span>
            {currencySymbol}
            {lineTotal.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};
