'use client';

import React, { useState } from 'react';
import type { TrackKey } from '../state/types';
import { TrackPresetSelector } from '../track-preset-selector/TrackPresetSelector';
import { HeroDesk3DCanvas } from './HeroDesk3DCanvas';
import { HeroInspectionHud } from './HeroInspectionHud';

export interface HeroStudioStageProps {
  activeTrack: TrackKey;
  onTrackSelect: (track: TrackKey) => void;
  onAddItem: (item: 'journal' | 'pencup') => void;
  currencySymbol?: string;
  className?: string;
}

export const HeroStudioStage: React.FC<HeroStudioStageProps> = ({
  activeTrack,
  onTrackSelect,
  onAddItem,
  currencySymbol = '$',
  className = '',
}) => {
  const [active3DItem, setActive3DItem] = useState<'journal' | 'pencup'>('journal');

  return (
    <section
      data-testid="hero-studio-stage"
      className={`relative pt-12 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col justify-between ${className}`}
    >
      {/* Top Studio Title & Subtitle */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-[#E07A38]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/60">
            CINEMATIC 3D STATIONERY STUDIO // FALL 2026
          </span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter text-white leading-none">
          BACK-TO-SCHOOL <br />
          <span className="text-[#EAE7DF]/40">STATIONERY & SUPPLY LIST</span>
        </h1>
        <p className="mt-4 max-w-2xl font-mono text-xs sm:text-sm text-white/70 uppercase leading-relaxed">
          ARCHIVAL NOTEBOOKS, PRECISION DRAFTING TOOLS, AND CURATED SEMESTER SUPPLY PACKS. SELECT
          YOUR ACADEMIC TRACK OR CUSTOMIZE YOUR CHECKLIST FOR CAMPUS LOCKER PICKUP.
        </p>

        {/* Quick Track Preset Selector */}
        <div className="mt-6">
          <TrackPresetSelector activeTrack={activeTrack} onTrackSelect={onTrackSelect} />
        </div>
      </div>

      {/* 3D WebGL Canvas Stage with Floating HUD Inspection */}
      <div className="relative w-full rounded-xl border border-white/10 bg-[#0E1014] overflow-hidden my-6 shadow-2xl">
        <HeroDesk3DCanvas activeItem={active3DItem} onSelectItem={setActive3DItem} />
        <div className="absolute bottom-6 right-6 z-20">
          <HeroInspectionHud
            activeItem={active3DItem}
            onSelectItem={setActive3DItem}
            onAddItem={onAddItem}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>

      {/* 3-Column Metadata Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10 font-mono text-xs">
        <div className="p-4 border border-white/10 bg-white/5">
          <div className="text-[10px] text-[#E07A38] uppercase font-bold mb-1">
            01 // PICKUP LOCKER BAYS
          </div>
          <div className="font-bold text-white text-sm uppercase">CAMPUS LOCKER PICKUP</div>
          <p className="text-[10px] text-white/60 uppercase mt-1">
            24/7 TOUCHLESS COLLECTION ACROSS STANFORD, UC BERKELEY, AND MIT CAMPUS HUBS.
          </p>
        </div>

        <div className="p-4 border border-white/10 bg-white/5">
          <div className="text-[10px] text-[#C9F24B] uppercase font-bold mb-1">
            02 // STUDENT VERIFICATION
          </div>
          <div className="font-bold text-white text-sm uppercase">15% .EDU DISCOUNT</div>
          <p className="text-[10px] text-white/60 uppercase mt-1">
            AUTOMATIC SAVINGS APPLIED AT RECEIPT GENERATION UPON ENTERING VALID STUDENT EMAIL.
          </p>
        </div>

        <div className="p-4 border border-white/10 bg-white/5">
          <div className="text-[10px] text-white/70 uppercase font-bold mb-1">
            03 // CURATED SYLLABI
          </div>
          <div className="font-bold text-white text-sm uppercase">4 ACADEMIC TRACKS</div>
          <p className="text-[10px] text-white/60 uppercase mt-1">
            ENGINEERED FOR HIGH SCHOOL CORE, UNIVERSITY STEM, AND ART & ARCHITECTURE STUDIOS.
          </p>
        </div>
      </div>
    </section>
  );
};
