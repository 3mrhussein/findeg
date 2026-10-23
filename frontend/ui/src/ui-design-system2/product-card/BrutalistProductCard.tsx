'use client';

import React from 'react';
import type { SupplyItem } from '../state/types';
import { ProductIllustration } from './ProductIllustration';

export interface BrutalistProductCardProps {
  item: SupplyItem;
  quantity?: number;
  isOwned?: boolean;
  onQuantityChange?: (delta: number) => void;
  onToggleOwned?: () => void;
  currencySymbol?: string;
  className?: string;
}

export const BrutalistProductCard: React.FC<BrutalistProductCardProps> = ({
  item,
  quantity = 0,
  isOwned = false,
  onQuantityChange,
  onToggleOwned,
  currencySymbol = '$',
  className = '',
}) => {
  const isInList = quantity > 0;

  return (
    <article
      data-testid={`product-card-${item.id}`}
      className={`group p-5 flex flex-col justify-between border border-[#181816] transition-all duration-200 ${
        isInList
          ? 'bg-[#F6F4EC] shadow-[inset_0_0_0_1.5px_#181816]'
          : 'bg-[#EAE7DF] hover:bg-[#F3F0E8] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#181816]'
      } ${className}`}
    >
      {/* Top Row: Odometer Index + Category Badge + Already Owned Toggle */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#181816]/15 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#141413]">{item.index}</span>
          <span className="text-[10px] uppercase px-2 py-0.5 bg-[#141413]/10 text-[#141413] font-semibold">
            {item.badge}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleOwned}
          className={`text-[10px] uppercase px-2 py-0.5 border border-[#181816] font-semibold transition-colors ${
            isOwned
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white/70 text-[#141413]/75 hover:bg-[#141413] hover:text-white'
          }`}
          title="Mark if you already own this item at home"
          aria-pressed={isOwned}
        >
          {isOwned ? '✓ OWNED' : 'HAVE IT?'}
        </button>
      </div>

      {/* Center Studio Product Illustration */}
      <div className="my-6 flex items-center justify-center">
        <ProductIllustration svgType={item.svgType} />
      </div>

      {/* Bottom Metadata + Price + Add / Stepper */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="font-mono text-xs sm:text-[13px] font-bold uppercase text-[#141413] tracking-tight">
            {item.title}
          </h3>
          <span className="font-mono text-sm font-extrabold text-[#141413]">
            {currencySymbol}
            {item.price.toFixed(2)}
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase text-[#141413]/65 mb-4 line-clamp-1">
          {item.specs}
        </p>

        {isInList ? (
          <div className="flex items-center justify-between border border-[#181816] bg-[#141413] text-[#F6F4EE] font-mono text-xs">
            <button
              type="button"
              aria-label="−"
              onClick={() => onQuantityChange?.(-1)}
              className="px-3.5 py-2 hover:bg-[#E07A38] transition-colors font-bold cursor-pointer"
            >
              −
            </button>
            <span className="text-[11px] uppercase font-bold tracking-tight">
              IN LIST: {quantity} {isOwned ? '(OWNED)' : ''}
            </span>
            <button
              type="button"
              aria-label="+"
              onClick={() => onQuantityChange?.(1)}
              className="px-3.5 py-2 hover:bg-[#E07A38] transition-colors font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onQuantityChange?.(1)}
            className="w-full py-2 px-3 border border-[#181816] bg-white hover:bg-[#141413] hover:text-[#F6F4EE] text-[#141413] font-mono text-xs uppercase font-bold transition-colors cursor-pointer"
          >
            + ADD TO SUPPLY LIST
          </button>
        )}
      </div>
    </article>
  );
};
