'use client';

import React from 'react';

export interface StudioHeaderProps {
  totalItemsCount?: number;
  onOpenPromptBlueprint?: () => void;
  onOpenSupplyList?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  brandTitle?: string;
  className?: string;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  totalItemsCount = 0,
  onOpenPromptBlueprint,
  onOpenSupplyList,
  onNavigateSection,
  brandTitle = 'notd°',
  className = '',
}) => {
  return (
    <header
      data-testid="studio-header"
      className={`sticky top-0 z-50 backdrop-blur-md bg-[#0E1014]/90 border-b border-white/10 px-4 sm:px-6 py-3 transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Edition */}
        <div className="flex items-center gap-3">
          <span className="font-sans font-black text-xl tracking-tighter text-white">
            {brandTitle}
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider text-white/50 border-l border-white/20 pl-3">
            // STUDIO 09 • FALL 2026
          </span>
        </div>

        {/* Section Navigation Triggers */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-[11px] uppercase">
          <button
            type="button"
            onClick={() => onNavigateSection?.('catalog')}
            className="px-2.5 py-1 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            [01] CATALOG
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection?.('study-clock')}
            className="px-2.5 py-1 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            [02] STUDY CLOCK
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection?.('zero-gravity')}
            className="px-2.5 py-1 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            [03] ZERO-G
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection?.('thermal-receipt')}
            className="px-2.5 py-1 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            [04] RECEIPT
          </button>
        </nav>

        {/* Right Actions: AI Prompt Blueprint & Supply List Counter */}
        <div className="flex items-center gap-2.5">
          {onOpenPromptBlueprint && (
            <button
              type="button"
              onClick={onOpenPromptBlueprint}
              className="px-2.5 py-1.5 border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
            >
              PROMPT BLUEPRINT
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSupplyList}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#181816] bg-[#141413] hover:bg-[#E07A38] text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F24B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9F24B]" />
            </span>
            <span>SUPPLY LIST</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-[#C9F24B] font-extrabold rounded-sm">
              {totalItemsCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
