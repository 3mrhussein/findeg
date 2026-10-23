import React from 'react';
import type { SupplyItem } from '../state/types';

export interface ProductIllustrationProps {
  svgType: SupplyItem['svgType'];
  className?: string;
}

export const ProductIllustration: React.FC<ProductIllustrationProps> = ({
  svgType,
  className = 'w-36 h-32 mx-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105',
}) => {
  switch (svgType) {
    case 'journal':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="B5 Dot-Grid Journal">
          <rect x="42" y="14" width="96" height="122" rx="6" fill="#181816" />
          <rect
            x="46"
            y="14"
            width="90"
            height="120"
            rx="5"
            fill="#F5F2EA"
            stroke="#181816"
            strokeWidth="2"
          />
          <rect x="42" y="14" width="14" height="122" rx="3" fill="#181816" />
          <rect x="122" y="12" width="5" height="126" fill="#181816" />
          <path d="M82 134 L82 146 L88 141 L94 146 L94 134 Z" fill="#E07A38" />
          <rect
            x="64"
            y="34"
            width="50"
            height="44"
            fill="#EAE7DF"
            stroke="#181816"
            strokeWidth="1.5"
          />
          <text
            x="89"
            y="53"
            textAnchor="middle"
            fontFamily="Inter Tight, sans-serif"
            fontWeight="900"
            fontSize="11"
            fill="#181816"
          >
            notd°
          </text>
          <text
            x="89"
            y="67"
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="12"
            fill="#E07A38"
          >
            field notes
          </text>
          <line
            x1="64"
            y1="98"
            x2="114"
            y2="98"
            stroke="#181816"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x="89"
            y="110"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="6.5"
            fill="#181816"
          >
            B5 • 160GSM DOT
          </text>
        </svg>
      );
    case 'pens':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="0.5MM Gel Pen 6-Pack">
          <g transform="rotate(-12 90 75)">
            <rect x="52" y="18" width="14" height="112" rx="3" fill="#181816" />
            <rect x="50" y="26" width="3" height="36" rx="1.5" fill="#E07A38" />
            <polygon points="52,130 66,130 59,142" fill="#C0C4CC" />
            <rect x="74" y="14" width="14" height="112" rx="3" fill="#232730" />
            <rect x="72" y="22" width="3" height="36" rx="1.5" fill="#C9F24B" />
            <polygon points="74,126 88,126 81,138" fill="#C0C4CC" />
            <rect x="96" y="18" width="14" height="112" rx="3" fill="#181816" />
            <rect x="94" y="26" width="3" height="36" rx="1.5" fill="#F5F2EA" />
            <polygon points="96,130 110,130 103,142" fill="#C0C4CC" />
            <rect
              x="46"
              y="68"
              width="70"
              height="24"
              rx="2"
              fill="#F5F2EA"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <text
              x="81"
              y="83"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              fontSize="8"
              fill="#181816"
            >
              0.5MM GEL × 6
            </text>
          </g>
        </svg>
      );
    case 'highlighters':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="Pastel Highlighter Set">
          <g transform="translate(8, 0)">
            <rect
              x="34"
              y="24"
              width="22"
              height="102"
              rx="4"
              fill="#E8A598"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <line x1="34" y1="54" x2="56" y2="54" stroke="#181816" strokeWidth="1.5" />
            <rect
              x="64"
              y="18"
              width="22"
              height="102"
              rx="4"
              fill="#A3C1AD"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <line x1="64" y1="48" x2="86" y2="48" stroke="#181816" strokeWidth="1.5" />
            <rect
              x="94"
              y="24"
              width="22"
              height="102"
              rx="4"
              fill="#F3E08B"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <line x1="94" y1="54" x2="116" y2="54" stroke="#181816" strokeWidth="1.5" />
            <rect
              x="124"
              y="30"
              width="22"
              height="96"
              rx="4"
              fill="#E07A38"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <line x1="124" y1="58" x2="146" y2="58" stroke="#181816" strokeWidth="1.5" />
          </g>
        </svg>
      );
    case 'ruler':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="Aluminum Scale Ruler">
          <g transform="rotate(-28 90 75)">
            <rect
              x="16"
              y="56"
              width="148"
              height="36"
              rx="3"
              fill="#D5D8DC"
              stroke="#181816"
              strokeWidth="2"
            />
            <rect x="16" y="70" width="148" height="8" fill="#181816" />
            <line x1="28" y1="56" x2="28" y2="66" stroke="#181816" strokeWidth="1.5" />
            <line x1="40" y1="56" x2="40" y2="63" stroke="#181816" strokeWidth="1.2" />
            <line x1="52" y1="56" x2="52" y2="66" stroke="#181816" strokeWidth="1.5" />
            <line x1="64" y1="56" x2="64" y2="63" stroke="#181816" strokeWidth="1.2" />
            <line x1="76" y1="56" x2="76" y2="66" stroke="#181816" strokeWidth="1.5" />
            <line x1="88" y1="56" x2="88" y2="63" stroke="#181816" strokeWidth="1.2" />
            <line x1="100" y1="56" x2="100" y2="66" stroke="#181816" strokeWidth="1.5" />
            <line x1="112" y1="56" x2="112" y2="63" stroke="#181816" strokeWidth="1.2" />
            <line x1="124" y1="56" x2="124" y2="66" stroke="#181816" strokeWidth="1.5" />
            <line x1="136" y1="56" x2="136" y2="63" stroke="#181816" strokeWidth="1.2" />
            <line x1="148" y1="56" x2="148" y2="66" stroke="#181816" strokeWidth="1.5" />
            <text
              x="90"
              y="88"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              fontSize="7"
              fill="#181816"
            >
              NOTD° 30CM ARCHITECT SCALE
            </text>
          </g>
        </svg>
      );
    case 'pencil':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="Drafting Pencil 0.5MM">
          <g transform="rotate(22 90 75)">
            <rect x="83" y="12" width="14" height="82" fill="#181816" />
            <rect
              x="83"
              y="94"
              width="14"
              height="26"
              fill="#C89D54"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <line x1="83" y1="100" x2="97" y2="100" stroke="#181816" strokeWidth="1" />
            <line x1="83" y1="106" x2="97" y2="106" stroke="#181816" strokeWidth="1" />
            <line x1="83" y1="112" x2="97" y2="112" stroke="#181816" strokeWidth="1" />
            <polygon
              points="83,120 97,120 90,138"
              fill="#C89D54"
              stroke="#181816"
              strokeWidth="1.5"
            />
            <line x1="90" y1="138" x2="90" y2="145" stroke="#181816" strokeWidth="2" />
            <rect x="97" y="26" width="4" height="38" rx="1" fill="#C89D54" />
            <rect x="85" y="4" width="10" height="8" rx="1" fill="#E07A38" />
          </g>
        </svg>
      );
    case 'tabs':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="Index Tab & Sticky Kit">
          <rect
            x="36"
            y="22"
            width="108"
            height="106"
            rx="6"
            fill="#F5F2EA"
            stroke="#181816"
            strokeWidth="2"
          />
          <rect
            x="48"
            y="34"
            width="54"
            height="16"
            fill="#E07A38"
            stroke="#181816"
            strokeWidth="1.2"
          />
          <rect
            x="48"
            y="56"
            width="54"
            height="16"
            fill="#C9F24B"
            stroke="#181816"
            strokeWidth="1.2"
          />
          <rect
            x="48"
            y="78"
            width="54"
            height="16"
            fill="#93C5FD"
            stroke="#181816"
            strokeWidth="1.2"
          />
          <rect
            x="48"
            y="100"
            width="54"
            height="16"
            fill="#FDE047"
            stroke="#181816"
            strokeWidth="1.2"
          />
          <rect x="110" y="34" width="22" height="82" fill="#181816" />
          <text
            x="121"
            y="78"
            textAnchor="middle"
            transform="rotate(-90 121 78)"
            fontFamily="JetBrains Mono, monospace"
            fontSize="7"
            fill="#F5F2EA"
          >
            300 FLAGS
          </text>
        </svg>
      );
    case 'case':
      return (
        <svg viewBox="0 0 180 150" className={className} aria-label="Cordura Pen Case">
          <rect
            x="24"
            y="42"
            width="132"
            height="68"
            rx="14"
            fill="#1F2229"
            stroke="#181816"
            strokeWidth="2"
          />
          <line
            x1="26"
            y1="62"
            x2="154"
            y2="62"
            stroke="#E07A38"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
          <rect x="138" y="58" width="14" height="8" rx="2" fill="#E07A38" />
          <rect x="64" y="74" width="52" height="22" rx="2" fill="#F5F2EA" />
          <text
            x="90"
            y="88"
            textAnchor="middle"
            fontFamily="Inter Tight, sans-serif"
            fontWeight="900"
            fontSize="11"
            fill="#181816"
          >
            notd°
          </text>
        </svg>
      );
    case 'calc':
      return (
        <svg
          viewBox="0 0 180 150"
          className={className}
          aria-label="Graphing Scientific Calculator"
        >
          <rect
            x="48"
            y="14"
            width="84"
            height="122"
            rx="8"
            fill="#1E222A"
            stroke="#181816"
            strokeWidth="2"
          />
          <rect
            x="56"
            y="24"
            width="68"
            height="34"
            rx="3"
            fill="#C9F24B"
            stroke="#181816"
            strokeWidth="1.5"
          />
          <path d="M60 48 Q75 28 90 42 T120 30" fill="none" stroke="#181816" strokeWidth="2" />
          <g fill="#F5F2EA">
            <rect x="56" y="66" width="14" height="10" rx="1.5" />
            <rect x="74" y="66" width="14" height="10" rx="1.5" />
            <rect x="92" y="66" width="14" height="10" rx="1.5" />
            <rect x="110" y="66" width="14" height="10" rx="1.5" fill="#E07A38" />
            <rect x="56" y="82" width="14" height="10" rx="1.5" />
            <rect x="74" y="82" width="14" height="10" rx="1.5" />
            <rect x="92" y="82" width="14" height="10" rx="1.5" />
            <rect x="110" y="82" width="14" height="10" rx="1.5" />
            <rect x="56" y="98" width="14" height="10" rx="1.5" />
            <rect x="74" y="98" width="14" height="10" rx="1.5" />
            <rect x="92" y="98" width="14" height="10" rx="1.5" />
            <rect x="110" y="98" width="14" height="10" rx="1.5" />
            <rect x="56" y="114" width="32" height="10" rx="1.5" />
            <rect x="92" y="114" width="14" height="10" rx="1.5" />
            <rect x="110" y="114" width="14" height="10" rx="1.5" fill="#C9F24B" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};
