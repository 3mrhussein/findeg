import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export interface CampusHubOption {
  value: string;
  label: string;
}

export const DEFAULT_CAMPUS_HUBS: CampusHubOption[] = [
  {
    value: 'Palo Alto — 420 University Ave (Locker #04)',
    label: 'PALO ALTO — 420 UNIVERSITY AVE (LOCKER #04)',
  },
  {
    value: 'Berkeley — 185 Bancroft Way (24/7 Hub)',
    label: 'BERKELEY — 185 BANCROFT WAY (24/7 HUB)',
  },
  {
    value: 'Cambridge — 77 Massachusetts Ave (Student Lounge)',
    label: 'CAMBRIDGE — 77 MASSACHUSETTS AVE (STUDENT LOUNGE)',
  },
  {
    value: 'Direct Dorm / Home Shipping (Free over $25)',
    label: 'DIRECT DORM / HOME SHIPPING (2-DAY EXPRESS)',
  },
];

export interface CheckoutSummaryData {
  totalItems: number;
  eduDiscountActive: boolean;
  netTotalDue: number;
  formattedNetTotal?: string;
}

export interface CheckoutReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: CheckoutSummaryData;
  defaultEmail?: string;
  hubOptions?: CampusHubOption[];
  currencySymbol?: string;
  onConfirmReservation?: (details: {
    email: string;
    hub: string;
    summary: CheckoutSummaryData;
  }) => void;
  className?: string;
}

export const CheckoutReservationModal: React.FC<CheckoutReservationModalProps> = ({
  open,
  onOpenChange,
  summary,
  defaultEmail = 'alex.rivera@stanford.edu',
  hubOptions = DEFAULT_CAMPUS_HUBS,
  currencySymbol = '$',
  onConfirmReservation,
  className = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [selectedHub, setSelectedHub] = useState(hubOptions[0]?.value ?? '');

  const netTotalDisplay =
    summary.formattedNetTotal ?? `${currencySymbol}${summary.netTotalDue.toFixed(2)}`;

  const handleConfirm = () => {
    onConfirmReservation?.({
      email,
      hub: selectedHub,
      summary,
    });
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          data-testid="checkout-reservation-modal"
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg bg-[#F4F0E6] text-[#141413] border-2 border-[#181816] rounded-xl p-6 shadow-2xl font-mono focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dashed border-[#141413]/40 pb-3 mb-4">
            <span className="text-xs uppercase font-bold text-[#E07A38]">
              // CAMPUS LOCKER &amp; DELIVERY RESERVATION
            </span>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                data-testid="close-checkout-modal-btn"
                className="text-xs uppercase px-2 py-1 border border-[#141413] hover:bg-[#141413] hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* Title */}
          <DialogPrimitive.Title className="font-sans text-2xl sm:text-3xl font-black uppercase mb-2 leading-tight">
            YOUR SUPPLY PACK IS READY TO STAGE.
          </DialogPrimitive.Title>

          {/* Description */}
          <DialogPrimitive.Description className="text-xs text-[#141413]/75 mb-4 leading-relaxed font-mono">
            Select your campus pickup hub or dorm delivery below. Items marked as &quot;Already
            Owned&quot; stay on your printable checklist at $0.00.
          </DialogPrimitive.Description>

          {/* Form Fields */}
          <div className="space-y-3 mb-5 text-xs">
            <div>
              <label
                htmlFor="checkout-student-email"
                className="block text-[10px] uppercase font-bold mb-1 tracking-wider"
              >
                STUDENT .EDU EMAIL (FOR 15% DISCOUNT &amp; LOCKER CODE)
              </label>
              <input
                id="checkout-student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-white border border-[#181816] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#181816]"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-hub-select"
                className="block text-[10px] uppercase font-bold mb-1 tracking-wider"
              >
                PICKUP HUB OR DELIVERY
              </label>
              <select
                id="checkout-hub-select"
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full bg-white border border-[#181816] px-3 py-2 text-xs uppercase focus:outline-none cursor-pointer"
              >
                {hubOptions.map((hub) => (
                  <option key={hub.value} value={hub.value}>
                    {hub.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order Summary Box */}
          <div
            data-testid="checkout-summary-box"
            className="bg-white border border-[#181816] p-3.5 mb-5 text-xs space-y-1.5"
          >
            <div className="flex justify-between">
              <span className="text-[#141413]/75">TOTAL CHECKLIST ITEMS:</span>
              <span className="font-bold">{summary.totalItems} ITEMS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141413]/75">STUDENT .EDU DISCOUNT:</span>
              <span className="font-bold text-[#E07A38]">
                {summary.eduDiscountActive ? '15% APPLIED' : 'NONE'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#181816]/20">
              <span>NET AMOUNT DUE AT PICKUP:</span>
              <span>{netTotalDisplay}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="confirm-reservation-btn"
              onClick={handleConfirm}
              className="flex-1 py-3 bg-[#141413] hover:bg-[#E07A38] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              CONFIRM RESERVATION →
            </button>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                data-testid="back-checkout-modal-btn"
                className="px-4 py-3 border border-[#181816] text-xs uppercase hover:bg-black/5 transition-colors cursor-pointer"
              >
                BACK
              </button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
