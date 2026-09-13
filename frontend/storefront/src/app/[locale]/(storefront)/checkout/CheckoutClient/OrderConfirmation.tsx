'use client';

import { Button } from '@findeg/ui';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from '@i18n/navigation';
import type { PlaceOrderResult } from './CheckoutClient.interface';

interface OrderConfirmationProps {
  result: PlaceOrderResult;
  continueLabel: string;
  confirmTitle: string;
}

/**
 * Order success screen — shown after a successful checkout.
 */
export function OrderConfirmation({ result, continueLabel, confirmTitle }: OrderConfirmationProps) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-8 md:p-12 text-center shadow-lg">
      <div className="size-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
        {confirmTitle}
      </h2>
      <p aria-live="polite" className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
        {result.message}
      </p>
      {result.orderId && (
        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 text-slate-900 dark:text-white font-mono font-medium mb-10">
          <span className="text-slate-500 font-sans text-sm">Order ID:</span> #{result.orderId}
        </div>
      )}
      <div>
        <Button
          onClick={() => router.push('/shop')}
          size="lg"
          className="rounded-full px-8 h-12 text-base shadow-sm"
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
