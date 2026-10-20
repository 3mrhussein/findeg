import React from 'react';
import type { TrackKey, Category } from '../state/types';

export interface CarbonFooterProps {
  onSelectTrackPreset?: (trackId: TrackKey) => void;
  onSelectCategory?: (category: Category) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenPromptBlueprint?: () => void;
  brandName?: string;
  tagline?: string;
  supportEmail?: string;
  classroomOrderNotice?: string;
  campusHubsNotice?: string;
  copyrightText?: string;
  className?: string;
}

export const CarbonFooter: React.FC<CarbonFooterProps> = ({
  onSelectTrackPreset,
  onSelectCategory,
  onNavigateSection,
  onOpenPromptBlueprint,
  brandName = 'notd',
  tagline = 'TOOLS FOR RIGHT NOW. BUILT FOR YOUR SEMESTER.',
  supportEmail = 'HELLO@NOTD.STUDIO',
  classroomOrderNotice = 'BULK CLASSROOM ORDERS AVAILABLE',
  campusHubsNotice = 'CAMPUS HUBS: PALO ALTO • BERKELEY • CAMBRIDGE',
  copyrightText = '© 2026 NOTD° PAPER & SUPPLY STUDIO — CINEMATIC 3D WEB EXPERIENCE',
  className = '',
}) => {
  return (
    <footer
      data-testid="carbon-footer"
      className={`bg-[#08090B] text-[#F6F4EE] pt-16 pb-12 px-4 sm:px-10 lg:px-14 border-t border-white/10 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-white/10 font-mono text-xs uppercase">
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div
              data-testid="carbon-brand"
              className="text-2xl font-extrabold tracking-tighter lowercase font-sans"
            >
              {brandName}
              <span className="text-[#E07A38]">°</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed normal-case">
              {tagline.split('. ').map((part, i) => (
                <span key={i} className="block uppercase">
                  {part}
                  {i === 0 ? '.' : ''}
                </span>
              ))}
            </p>
          </div>

          {/* Column 2: Grade Lists */}
          <div className="space-y-2">
            <div className="text-white/40 text-[10px] tracking-wider font-bold">GRADE LISTS</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTrackPreset?.('highschool')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  HIGH SCHOOL CORE
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTrackPreset?.('stem')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  UNIVERSITY STEM
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTrackPreset?.('studio')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  ARCH &amp; DESIGN STUDIO
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTrackPreset?.('all')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  COMPLETE MASTER KIT
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Stationery Categories */}
          <div className="space-y-2">
            <div className="text-white/40 text-[10px] tracking-wider font-bold">STATIONERY</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.('PAPER')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  160GSM DOT JOURNALS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.('WRITING')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  0.5MM ARCHIVAL PENS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.('DRAFTING')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  ALUMINUM SCALES
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.('DRAFTING')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  CORDURA PEN CASES
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Navigation Links */}
          <div className="space-y-2">
            <div className="text-white/40 text-[10px] tracking-wider font-bold">NAVIGATION</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection?.('hero')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  3D DESK STAGE
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection?.('study-clock')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  STUDY CLOCK DIAL
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection?.('zero-gravity')}
                  className="hover:text-[#E07A38] transition-colors cursor-pointer text-left"
                >
                  ZERO-G 3D FIELD
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPromptBlueprint?.()}
                  className="text-[#C9F24B] hover:underline font-bold transition-colors cursor-pointer text-left"
                >
                  PROMPT BLUEPRINT ✦
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Student Desk Info */}
          <div className="space-y-2">
            <div className="text-white/40 text-[10px] tracking-wider font-bold">STUDENT DESK</div>
            <div className="text-[11px] text-white/80">{supportEmail}</div>
            <div className="text-[10px] text-[#C9F24B] pt-1 leading-snug">
              {classroomOrderNotice}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] uppercase text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E07A38]" />
            <span>{campusHubsNotice}</span>
          </div>
          <div>{copyrightText}</div>
        </div>
      </div>
    </footer>
  );
};
