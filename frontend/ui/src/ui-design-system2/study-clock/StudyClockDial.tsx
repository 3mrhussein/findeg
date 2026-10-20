'use client';

import React, { useState } from 'react';
import { CLOCK_SESSIONS, type StudyClockSession } from './types';

export interface StudyClockDialProps {
  activeSessionIndex?: number;
  onSelectSession?: (index: number) => void;
  className?: string;
}

export const StudyClockDial: React.FC<StudyClockDialProps> = ({
  activeSessionIndex,
  onSelectSession,
  className = '',
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = activeSessionIndex !== undefined ? activeSessionIndex : internalIndex;
  const currentSession: StudyClockSession = CLOCK_SESSIONS[currentIndex] || CLOCK_SESSIONS[0]!;

  const handleSessionClick = (index: number) => {
    setInternalIndex(index);
    onSelectSession?.(index);
  };

  // Generate 60 radial ticks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = i * 6;
    const isHour = i % 5 === 0;
    const r1 = isHour ? 176 : 182;
    const r2 = 190;
    const strokeWidth = isHour ? 2.2 : 1;
    const opacity = isHour ? 0.85 : 0.35;
    return (
      <line
        key={i}
        x1="0"
        y1={`-${r1}`}
        x2="0"
        y2={`-${r2}`}
        stroke="#141413"
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        transform={`rotate(${angle})`}
      />
    );
  });

  // Numerals 1 to 12
  const numerals = [
    { num: '12', x: 235, y: 78 },
    { num: '1', x: 315, y: 100 },
    { num: '2', x: 375, y: 160 },
    { num: '3', x: 400, y: 242 },
    { num: '4', x: 375, y: 320 },
    { num: '5', x: 315, y: 382 },
    { num: '6', x: 235, y: 405 },
    { num: '7', x: 155, y: 382 },
    { num: '8', x: 95, y: 320 },
    { num: '9', x: 70, y: 242 },
    { num: '10', x: 95, y: 160 },
    { num: '11', x: 155, y: 100 },
  ];

  return (
    <div
      data-testid="study-clock-dial-container"
      className={`flex flex-col items-center max-w-[540px] mx-auto ${className}`}
    >
      {/* Active Floating Session Badge */}
      <div className="mb-4 text-center">
        <span className="inline-block px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider bg-[#141413] text-[#C9F24B] shadow-sm">
          {currentSession.badge}
        </span>
        <div className="font-mono text-[10px] uppercase text-[#141413]/60 mt-1">
          HOURS: {currentSession.hours} • RECOMMENDED: {currentSession.recommendedSupplies}
        </div>
      </div>

      {/* Analog Study Clock SVG Stage */}
      <div className="relative w-[340px] h-[340px] sm:w-[470px] sm:h-[470px] rounded-full p-2 bg-[#EAE7DF] border-2 border-[#181816] shadow-[8px_8px_0px_#181816]">
        <svg viewBox="0 0 470 470" className="w-full h-full" aria-label="Analog Study Clock Dial">
          {/* Outer Ring & Radial Ticks */}
          <circle cx="235" cy="235" r="215" fill="none" stroke="#141413" strokeWidth="1.5" />
          <circle
            cx="235"
            cy="235"
            r="225"
            fill="none"
            stroke="#141413"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          <g transform="translate(235, 235)">{ticks}</g>

          {/* Hour Numerals 1–12 */}
          {numerals.map((n) => (
            <text
              key={n.num}
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Inter Tight, sans-serif"
              fontWeight="900"
              fontSize="20"
              fill="#141413"
            >
              {n.num}
            </text>
          ))}

          {/* Center Brand Stamp */}
          <text
            x="235"
            y="170"
            textAnchor="middle"
            fontFamily="Inter Tight, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="#141413"
          >
            notd°
          </text>
          <text
            x="235"
            y="186"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="8"
            letterSpacing="0.1em"
            fill="#141413"
          >
            STUDY RHYTHM DIAL
          </text>
        </svg>

        {/* Center Rotating Ruler Hand & Ceramic Pen Cup Rotor */}
        <div
          data-testid="clock-hand-rotor"
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out origin-center"
          style={{ transform: `rotate(${currentSession.angle}deg)` }}
        >
          {/* Aluminum 30cm Ruler Hand */}
          <div className="absolute top-[38px] w-6 h-[195px] bg-[#D5D8DC] border border-[#181816] rounded-t-sm shadow-md flex flex-col justify-between items-center py-2">
            <span className="font-mono text-[7px] font-bold text-[#141413] rotate-90 origin-center tracking-widest mt-6">
              30CM SCALE
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E07A38]" />
          </div>

          {/* Ceramic Pen Cup Hub */}
          <div className="w-16 h-16 rounded-full bg-[#EFECE4] border-2 border-[#181816] shadow-lg flex items-center justify-center z-10">
            <div className="w-6 h-6 rounded-full bg-[#181816] border border-[#C9F24B]" />
          </div>
        </div>
      </div>

      {/* Preset Session Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        {CLOCK_SESSIONS.map((session, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={session.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSessionClick(idx)}
              className={`font-mono text-[11px] uppercase px-3 py-1.5 border border-[#181816] transition-all cursor-pointer font-bold ${
                isActive
                  ? 'bg-[#141413] text-[#F6F4EE] shadow-[2px_2px_0px_#181816]'
                  : 'bg-white hover:bg-[#141413] hover:text-[#F6F4EE] text-[#141413]'
              }`}
            >
              {session.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
