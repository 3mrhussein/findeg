import React from 'react';

export interface ReceiptDispenserHousingProps {
  statusText?: string;
  isOnline?: boolean;
  className?: string;
}

export const ReceiptDispenserHousing: React.FC<ReceiptDispenserHousingProps> = ({
  statusText = 'ONLINE // THERMAL DISPENSER ACTIVE',
  isOnline = true,
  className = '',
}) => {
  return (
    <div
      data-testid="receipt-dispenser-housing"
      className={`w-full max-w-[480px] mx-auto rounded-t-lg p-3 bg-gradient-to-b from-[#52565E] via-[#2B2E34] to-[#383C44] border-t border-white/35 border-b border-black/80 shadow-[0_16px_36px_rgba(0,0,0,0.75),inset_0_1px_2px_rgba(255,255,255,0.25)] ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-white/80 px-2 pb-2">
        <div className="flex items-center gap-2">
          {isOnline && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9F24B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9F24B]" />
            </span>
          )}
          <span>{statusText}</span>
        </div>
        <div className="text-[#E07A38] uppercase">NOTD° PR-200</div>
      </div>
      {/* Aluminum Slot opening */}
      <div className="h-3 w-full rounded-sm bg-gradient-to-b from-[#040506] to-[#121417] shadow-[inset_0_4px_8px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.18)]" />
    </div>
  );
};
