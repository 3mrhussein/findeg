import React from 'react';

export interface PhilosophyBandProps {
  className?: string;
}

export const PhilosophyBand: React.FC<PhilosophyBandProps> = ({ className = '' }) => {
  return (
    <div
      data-testid="philosophy-band"
      className={`grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10 font-mono text-xs ${className}`}
    >
      <div className="space-y-1.5">
        <div className="text-[10px] text-[#E07A38] uppercase font-bold tracking-wider">
          PHILOSOPHY 01 // MATERIAL SENSITIVITY
        </div>
        <h4 className="font-bold text-sm uppercase text-white tracking-tight">TACTILE UTILITY</h4>
        <p className="text-[11px] text-white/60 uppercase leading-relaxed">
          ARCHIVAL 160GSM PAPERS, KNURLED BRASS CLUTCHES, AND ANODIZED ALUMINUM RULERS DESIGNED FOR
          A DECADE OF SERIOUS STUDY.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] text-[#C9F24B] uppercase font-bold tracking-wider">
          PHILOSOPHY 02 // COGNITIVE ERGONOMICS
        </div>
        <h4 className="font-bold text-sm uppercase text-white tracking-tight">ZERO DISTRACTION</h4>
        <p className="text-[11px] text-white/60 uppercase leading-relaxed">
          5MM DOT-GRID GEOMETRIES GUIDE ARCHITECTURAL SCHEMATICS AND LECTURE DIAGRAMS WITHOUT
          COMPETING WITH YOUR INK.
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
          PHILOSOPHY 03 // LOGISTICAL EFFICIENCY
        </div>
        <h4 className="font-bold text-sm uppercase text-white tracking-tight">CAMPUS STAGING</h4>
        <p className="text-[11px] text-white/60 uppercase leading-relaxed">
          15-MINUTE DORM DELIVERY OR INSTANT 24/7 TOUCHLESS LOCKER COLLECTION ACROSS PARTNER
          UNIVERSITIES AND DESIGN LABS.
        </p>
      </div>
    </div>
  );
};
