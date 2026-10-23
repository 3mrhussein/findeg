import React from 'react';

export interface SawtoothEdgeProps {
  color?: string;
  className?: string;
}

export const SawtoothEdge: React.FC<SawtoothEdgeProps> = ({
  color = '#F4F0E6',
  className = '',
}) => {
  return (
    <div
      data-testid="sawtooth-edge"
      className={`w-full overflow-hidden leading-none ${className}`}
      style={{ height: '14px' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 14" preserveAspectRatio="none" className="w-full h-full block">
        <path
          d="M0 0 L10 14 L20 0 L30 14 L40 0 L50 14 L60 0 L70 14 L80 0 L90 14 L100 0 L110 14 L120 0 L130 14 L140 0 L150 14 L160 0 L170 14 L180 0 L190 14 L200 0 L210 14 L220 0 L230 14 L240 0 L250 14 L260 0 L270 14 L280 0 L290 14 L300 0 L310 14 L320 0 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
