import React from 'react';

export interface ReceiptActionsProps {
  onOrderNow?: () => void;
  onCopyList?: () => void;
  onResetList?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = ({
  onOrderNow,
  onCopyList,
  onResetList,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      data-testid="receipt-actions"
      className={`mt-5 space-y-2 font-mono text-xs uppercase ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onOrderNow}
        className="w-full py-2.5 px-4 bg-[#141413] hover:bg-[#E07A38] text-white font-extrabold tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
      >
        ORDER PACK NOW →
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCopyList}
          className="py-1.5 px-3 border border-[#141413] bg-white hover:bg-[#141413] hover:text-white font-bold transition-colors cursor-pointer"
        >
          COPY LIST
        </button>

        <button
          type="button"
          onClick={onResetList}
          className="py-1.5 px-3 border border-[#141413]/40 bg-transparent hover:border-[#141413] hover:text-red-700 text-[#141413]/70 font-semibold transition-colors cursor-pointer"
        >
          RESET
        </button>
      </div>
    </div>
  );
};
