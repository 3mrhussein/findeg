'use client';

import React from 'react';

export type ZeroGMode = 'float' | 'vortex';

export interface PhysicsModeBarProps {
  mode: ZeroGMode;
  onModeChange: (mode: ZeroGMode) => void;
  onScatterImpulse?: () => void;
  className?: string;
}

export const PhysicsModeBar: React.FC<PhysicsModeBarProps> = ({
  mode,
  onModeChange,
  onScatterImpulse,
  className = '',
}) => {
  return (
    <div
      data-testid="physics-mode-bar"
      className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0E1014]/90 border border-white/10 rounded-lg backdrop-blur-md font-mono text-xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/50 uppercase font-bold mr-1">PHYSICS MODE:</span>
        <button
          type="button"
          aria-pressed={mode === 'float'}
          onClick={() => onModeChange('float')}
          className={`px-3 py-1.5 uppercase font-bold transition-all cursor-pointer rounded text-[10px] ${
            mode === 'float'
              ? 'bg-[#E07A38] text-white shadow-sm'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          }`}
        >
          ZERO-G FLOAT
        </button>

        <button
          type="button"
          aria-pressed={mode === 'vortex'}
          onClick={() => onModeChange('vortex')}
          className={`px-3 py-1.5 uppercase font-bold transition-all cursor-pointer rounded text-[10px] ${
            mode === 'vortex'
              ? 'bg-[#E07A38] text-white shadow-sm'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          }`}
        >
          ORBIT SWIRL (VORTEX)
        </button>
      </div>

      {onScatterImpulse && (
        <button
          type="button"
          onClick={onScatterImpulse}
          className="px-3.5 py-1.5 bg-[#C9F24B] hover:bg-[#b8e236] text-[#0E1014] font-extrabold uppercase text-[10px] tracking-wider rounded transition-colors cursor-pointer shadow-sm"
        >
          ⚡ SCATTER IMPULSE
        </button>
      )}
    </div>
  );
};
