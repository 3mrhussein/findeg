import React from 'react';
import type { SupplyTotals } from '../state/types';

export interface ReceiptTotalsProps {
  totals: SupplyTotals;
  eduDiscountActive: boolean;
  onToggleEduDiscount?: () => void;
  currencySymbol?: string;
  className?: string;
}

export const ReceiptTotals: React.FC<ReceiptTotalsProps> = ({
  totals,
  eduDiscountActive,
  onToggleEduDiscount,
  currencySymbol = '$',
  className = '',
}) => {
  return (
    <div
      data-testid="receipt-totals"
      className={`border-t-2 border-dashed border-[#141413]/25 pt-3 mt-4 font-mono text-[11px] space-y-1.5 ${className}`}
    >
      <div className="flex items-center justify-between text-[#141413]/70">
        <span>TOTAL ITEMS</span>
        <span className="font-bold">{totals.totalQty}</span>
      </div>

      <div className="flex items-center justify-between text-[#141413]/70">
        <span>GROSS SUB-TOTAL</span>
        <span className="font-bold">
          {currencySymbol}
          {totals.grossSubtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between text-emerald-800 font-semibold">
        <span>OWNED AT HOME (DEDUCTION)</span>
        <span>
          -{currencySymbol}
          {totals.ownedDeduction.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[#141413]/80">
        <div className="flex items-center gap-1.5">
          <span>STUDENT .EDU DISCOUNT</span>
          {onToggleEduDiscount && (
            <button
              type="button"
              onClick={onToggleEduDiscount}
              className={`px-1.5 py-0.2 text-[9px] uppercase font-bold border border-[#141413] transition-colors cursor-pointer ${
                eduDiscountActive ? 'bg-[#C9F24B] text-[#0E1014]' : 'bg-white text-[#141413]'
              }`}
            >
              {eduDiscountActive ? '-15%' : 'OFF'}
            </button>
          )}
        </div>
        <span className="font-bold text-[#E07A38]">
          {eduDiscountActive
            ? `-${currencySymbol}${totals.eduDiscount.toFixed(2)}`
            : `${currencySymbol}0.00`}
        </span>
      </div>

      <div className="border-t-2 border-[#141413] pt-2 mt-2 flex items-baseline justify-between">
        <span className="font-extrabold text-sm uppercase tracking-tight text-[#141413]">
          NET TOTAL DUE
        </span>
        <span className="font-extrabold text-base text-[#141413]">
          {currencySymbol}
          {totals.finalTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
