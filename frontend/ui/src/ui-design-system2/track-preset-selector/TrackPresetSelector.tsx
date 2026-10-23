'use client';

import React from 'react';
import type { TrackKey } from '../state/types';

export interface TrackPresetSelectorProps {
  activeTrack: TrackKey;
  onTrackSelect: (track: TrackKey) => void;
  className?: string;
}

const TRACKS: Array<{ key: TrackKey; label: string }> = [
  { key: 'highschool', label: 'HIGH SCHOOL CORE' },
  { key: 'stem', label: 'UNIVERSITY STEM' },
  { key: 'studio', label: 'ART & ARCH STUDIO' },
  { key: 'all', label: 'FULL MASTER KIT' },
];

export const TrackPresetSelector: React.FC<TrackPresetSelectorProps> = ({
  activeTrack,
  onTrackSelect,
  className = '',
}) => {
  return (
    <div
      data-testid="track-preset-selector"
      className={`flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase ${className}`}
    >
      <span className="text-[10px] text-[#141413]/60 font-bold shrink-0 mr-1">
        QUICK-LOAD TRACK:
      </span>
      {TRACKS.map((t) => {
        const isActive = activeTrack === t.key;
        let btnClasses =
          'px-3.5 py-2 border border-[#181816] transition-all cursor-pointer font-semibold ';

        if (isActive) {
          if (t.key === 'all') {
            btnClasses += 'bg-[#C9F24B] text-[#141413] font-bold shadow-[2px_2px_0px_#181816]';
          } else {
            btnClasses += 'bg-[#E07A38] text-white font-bold shadow-[2px_2px_0px_#181816]';
          }
        } else {
          if (t.key === 'all') {
            btnClasses += 'bg-[#C9F24B]/30 hover:bg-[#C9F24B] text-[#141413]';
          } else {
            btnClasses += 'bg-white hover:bg-[#141413] hover:text-[#F6F4EE] text-[#141413]';
          }
        }

        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onTrackSelect(t.key)}
            className={btnClasses}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
