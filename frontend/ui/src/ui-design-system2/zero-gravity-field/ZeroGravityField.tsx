'use client';

import React, { useState } from 'react';
import { PhysicsModeBar, type ZeroGMode } from './PhysicsModeBar';
import { PhilosophyBand } from './PhilosophyBand';
import { ZeroGravity3DCanvas } from './ZeroGravity3DCanvas';

export interface ZeroGravityFieldProps {
  onNotify?: (msg: string) => void;
  className?: string;
}

export const ZeroGravityField: React.FC<ZeroGravityFieldProps> = ({ onNotify, className = '' }) => {
  const [mode, setMode] = useState<ZeroGMode>('float');
  const [scatterBoost, setScatterBoost] = useState<number>(0);

  const handleModeChange = (newMode: ZeroGMode) => {
    setMode(newMode);
    onNotify?.(
      newMode === 'vortex'
        ? 'ORBIT SWIRL PHYSICS MODE ACTIVATED'
        : 'ZERO-G FLOAT PHYSICS MODE ACTIVATED',
    );
  };

  const handleScatter = () => {
    setScatterBoost((b) => b + 1);
    onNotify?.('3D STATIONERY FIELD SCATTER IMPULSE TRIGGERED');
  };

  return (
    <section
      data-testid="zero-gravity-field"
      className={`py-16 px-4 sm:px-6 max-w-7xl mx-auto ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] text-[#E07A38] uppercase font-bold tracking-wider">
            SECTION 03 // WEIGHTLESS PERSPECTIVE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter text-white mt-1">
            ZERO-GRAVITY STATIONERY FIELD
          </h2>
        </div>
        <PhysicsModeBar
          mode={mode}
          onModeChange={handleModeChange}
          onScatterImpulse={handleScatter}
        />
      </div>

      {/* 3D WebGL Canvas */}
      <div className="relative w-full rounded-xl border border-white/10 bg-[#0E1014] overflow-hidden shadow-2xl mb-8">
        <ZeroGravity3DCanvas mode={mode} scatterBoost={scatterBoost} />
      </div>

      {/* Philosophy Statement Band */}
      <PhilosophyBand />
    </section>
  );
};
