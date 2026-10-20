'use client';

import React, { useState } from 'react';
import type { SupplyListEntry, SupplyTotals } from '../state/types';
import { ReceiptDispenserHousing } from '../receipt-dispenser/ReceiptDispenserHousing';
import { ReceiptItemRow } from '../receipt-item-row/ReceiptItemRow';
import { ReceiptTotals } from '../receipt-totals/ReceiptTotals';
import { ReceiptActions } from '../receipt-actions/ReceiptActions';
import { ReceiptBarcode } from '../receipt-barcode/ReceiptBarcode';
import { SawtoothEdge } from '../sawtooth-edge/SawtoothEdge';

export interface ThermalReceiptProps {
  items: Record<string, SupplyListEntry>;
  totals: SupplyTotals;
  activeTrackLabel?: string;
  eduDiscountActive: boolean;
  onToggleEduDiscount?: () => void;
  onQuantityChange?: (itemId: string, delta: number) => void;
  onToggleOwned?: (itemId: string) => void;
  onOrderNow?: () => void;
  onCopyList?: () => void;
  onResetList?: () => void;
  onAddCustomItem?: (title: string, price: number) => void;
  currencySymbol?: string;
  className?: string;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  items,
  totals,
  activeTrackLabel,
  eduDiscountActive,
  onToggleEduDiscount,
  onQuantityChange,
  onToggleOwned,
  onOrderNow,
  onCopyList,
  onResetList,
  onAddCustomItem,
  currencySymbol = '$',
  className = '',
}) => {
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('6.50');

  const activeItems = Object.values(items).filter((i) => i.qty > 0);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const priceNum = parseFloat(customPrice) || 5.0;
    onAddCustomItem?.(customName, priceNum);
    setCustomName('');
    setCustomPrice('6.50');
  };

  return (
    <div
      data-testid="thermal-receipt"
      className={`w-full max-w-[480px] mx-auto flex flex-col items-center ${className}`}
    >
      {/* Aluminum Dispenser Slot */}
      <ReceiptDispenserHousing />

      {/* Extruding Paper Receipt Body */}
      <div className="w-full bg-[#F4F0E6] text-[#141413] p-6 shadow-[0_28px_60px_rgba(0,0,0,0.65),0_4px_12px_rgba(0,0,0,0.4)] font-mono">
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-dashed border-[#141413]/30">
          <div className="text-2xl font-black tracking-tighter">notd°</div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#141413]/70 mt-0.5">
            CAMPUS STATIONERY & SUPPLY STUDIO
          </div>
          <div className="text-xs font-extrabold uppercase mt-2 px-2 py-0.5 inline-block bg-[#141413] text-[#F6F4EE]">
            TRACK: {activeTrackLabel}
          </div>
          <div className="text-[9px] text-[#141413]/50 uppercase mt-1">
            FALL SEMESTER 2026 // SLIP #8491-ED09
          </div>
        </div>

        {/* Itemized Goods */}
        <div className="py-3 min-h-[120px]">
          {activeItems.length === 0 ? (
            <div className="py-8 text-center text-xs uppercase text-[#141413]/60">
              YOUR SUPPLY LIST IS EMPTY.
            </div>
          ) : (
            activeItems.map((item) => (
              <ReceiptItemRow
                key={item.id}
                item={item}
                currencySymbol={currencySymbol}
                onQuantityChange={
                  onQuantityChange ? (delta) => onQuantityChange(item.id, delta) : undefined
                }
                onToggleOwned={onToggleOwned ? () => onToggleOwned(item.id) : undefined}
              />
            ))
          )}
        </div>

        {/* Optional Custom Item Row */}
        {onAddCustomItem && (
          <form
            onSubmit={handleAddCustom}
            className="flex items-center gap-1.5 pt-2 pb-3 border-t border-dashed border-[#141413]/20 text-[10px]"
          >
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="+ ADD CUSTOM ITEM..."
              className="flex-1 px-2 py-1 border border-[#141413]/40 bg-white placeholder:text-[#141413]/40 uppercase text-[10px] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
            <input
              type="number"
              step="0.5"
              min="0"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-14 px-1.5 py-1 border border-[#141413]/40 bg-white text-[10px] text-right focus:outline-none focus:ring-1 focus:ring-[#141413]"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-[#141413] text-white font-bold uppercase hover:bg-[#E07A38] transition-colors cursor-pointer"
            >
              ADD
            </button>
          </form>
        )}

        {/* Totals Breakdown */}
        <ReceiptTotals
          totals={totals}
          eduDiscountActive={eduDiscountActive}
          onToggleEduDiscount={onToggleEduDiscount}
          currencySymbol={currencySymbol}
        />

        {/* Action CTAs */}
        <ReceiptActions
          onOrderNow={onOrderNow}
          onCopyList={onCopyList}
          onResetList={onResetList}
          disabled={activeItems.length === 0}
        />

        {/* Authentic SVG Barcode */}
        <ReceiptBarcode
          trackingCode={`*NOTD-2026-${(activeTrackLabel ?? 'SUPPLY-LIST').replace(/\s+/g, '-')}-HUB*`}
        />

        {/* Footer Notice */}
        <div className="text-center text-[9px] uppercase text-[#141413]/50 pt-2 border-t border-dashed border-[#141413]/20">
          PICKUP CONFIRMATION REQUIRED AT CAMPUS LOCKER
        </div>
      </div>

      {/* Sawtooth Zig-Zag Bottom Edge */}
      <SawtoothEdge color="#F4F0E6" />
    </div>
  );
};
