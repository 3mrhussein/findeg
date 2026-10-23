import React from 'react';

export interface ReceiptBarcodeProps {
  trackingCode?: string;
  className?: string;
}

export const ReceiptBarcode: React.FC<ReceiptBarcodeProps> = ({
  trackingCode = '*NOTD-2026-FALL-B5-STU*',
  className = '',
}) => {
  return (
    <div
      data-testid="receipt-barcode"
      className={`my-4 flex flex-col items-center justify-center text-center font-mono ${className}`}
    >
      <svg
        viewBox="0 0 240 40"
        className="w-full max-w-[240px] h-9"
        aria-label="Receipt tracking barcode"
      >
        <g fill="#141413">
          <rect x="0" y="0" width="3" height="40" />
          <rect x="6" y="0" width="1.5" height="40" />
          <rect x="10" y="0" width="4" height="40" />
          <rect x="18" y="0" width="1.5" height="40" />
          <rect x="23" y="0" width="3" height="40" />
          <rect x="29" y="0" width="1" height="40" />
          <rect x="33" y="0" width="4.5" height="40" />
          <rect x="41" y="0" width="2" height="40" />
          <rect x="46" y="0" width="1.5" height="40" />
          <rect x="51" y="0" width="3.5" height="40" />
          <rect x="58" y="0" width="1" height="40" />
          <rect x="62" y="0" width="4" height="40" />
          <rect x="69" y="0" width="2" height="40" />
          <rect x="74" y="0" width="1.5" height="40" />
          <rect x="79" y="0" width="5" height="40" />
          <rect x="87" y="0" width="2" height="40" />
          <rect x="92" y="0" width="1.5" height="40" />
          <rect x="97" y="0" width="3.5" height="40" />
          <rect x="104" y="0" width="1" height="40" />
          <rect x="108" y="0" width="4" height="40" />
          <rect x="115" y="0" width="2" height="40" />
          <rect x="120" y="0" width="1.5" height="40" />
          <rect x="125" y="0" width="4.5" height="40" />
          <rect x="133" y="0" width="2" height="40" />
          <rect x="138" y="0" width="1.5" height="40" />
          <rect x="143" y="0" width="3.5" height="40" />
          <rect x="150" y="0" width="1" height="40" />
          <rect x="154" y="0" width="4" height="40" />
          <rect x="161" y="0" width="2" height="40" />
          <rect x="166" y="0" width="1.5" height="40" />
          <rect x="171" y="0" width="5" height="40" />
          <rect x="179" y="0" width="2" height="40" />
          <rect x="184" y="0" width="1.5" height="40" />
          <rect x="189" y="0" width="3.5" height="40" />
          <rect x="196" y="0" width="1" height="40" />
          <rect x="200" y="0" width="4" height="40" />
          <rect x="207" y="0" width="2" height="40" />
          <rect x="212" y="0" width="1.5" height="40" />
          <rect x="217" y="0" width="3" height="40" />
          <rect x="223" y="0" width="1.5" height="40" />
          <rect x="227" y="0" width="4" height="40" />
          <rect x="234" y="0" width="3" height="40" />
        </g>
      </svg>
      <span className="text-[9px] tracking-widest text-[#141413]/70 mt-1 uppercase">
        {trackingCode}
      </span>
    </div>
  );
};
