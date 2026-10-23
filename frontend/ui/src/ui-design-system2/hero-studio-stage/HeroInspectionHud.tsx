'use client';

import React from 'react';

export interface HeroInspectionHudProps {
  activeItem: 'journal' | 'pencup';
  onSelectItem: (item: 'journal' | 'pencup') => void;
  onAddItem: (item: 'journal' | 'pencup') => void;
  currencySymbol?: string;
  className?: string;
}

export const HeroInspectionHud: React.FC<HeroInspectionHudProps> = ({
  activeItem,
  onSelectItem,
  onAddItem,
  currencySymbol = '$',
  className = '',
}) => {
  const isJournal = activeItem === 'journal';

  return (
    <div
      data-testid="hero-inspection-hud"
      className={`backdrop-blur-md bg-[#0E1014]/80 border border-white/15 p-4 rounded-lg shadow-2xl font-mono text-xs text-[#F6F4EE] max-w-[340px] ${className}`}
    >
      {/* Top Switch Row */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px]">
        <span className="text-[#E07A38] font-bold">
          {isJournal ? '// IN THE BACKPACK' : '// ON THE DESK'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectItem('journal')}
            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
              isJournal ? 'bg-[#E07A38] text-white' : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            JOURNAL
          </button>
          <button
            type="button"
            onClick={() => onSelectItem('pencup')}
            className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
              !isJournal ? 'bg-[#E07A38] text-white' : 'bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            PEN CUP
          </button>
        </div>
      </div>

      {/* Main Item Spec Title & Price */}
      <div className="mb-2">
        <h4 className="font-bold text-sm uppercase tracking-tight text-white">
          {isJournal ? 'B5 DOT-GRID JOURNAL' : '0.5MM GEL PEN & SCALE SET'}
        </h4>
        <div className="text-[#C9F24B] font-extrabold text-sm mt-0.5">
          {isJournal ? `${currencySymbol}14.00` : `${currencySymbol}12.50`}
        </div>
      </div>

      <p className="text-[10px] text-white/70 uppercase leading-relaxed mb-3">
        {isJournal
          ? '192 PAGES • 160GSM IVORY • LAY-FLAT THREAD BOUND'
          : '6 ARCHIVAL GEL PENS + 30CM ALUMINUM RULER'}
      </p>

      {/* Add Button */}
      <button
        type="button"
        onClick={() => onAddItem(activeItem)}
        className="w-full py-2 px-3 border border-[#181816] bg-[#C9F24B] hover:bg-[#b8e236] text-[#0E1014] font-extrabold uppercase text-[11px] tracking-wider transition-colors cursor-pointer shadow-md"
      >
        + ADD TO SUPPLY LIST
      </button>
    </div>
  );
};
