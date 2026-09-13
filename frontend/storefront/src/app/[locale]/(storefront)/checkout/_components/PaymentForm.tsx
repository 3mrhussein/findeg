'use client';

import { CreditCard, Banknote } from 'lucide-react';

/**
 *
 */
export function PaymentForm({ paymentMethod, setPaymentMethod, t }: any) {
  return (
    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <legend className="sr-only">{t('Pages.Checkout.PaymentMethod')}</legend>

      <label
        htmlFor="payment-cod"
        className={`relative flex cursor-pointer flex-col p-6 rounded-2xl border-2 transition-all ${
          paymentMethod === 'cod'
            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hover:border-primary/50'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`flex size-10 items-center justify-center rounded-full ${paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
          >
            <Banknote className="h-5 w-5" />
          </div>
          <input
            id="payment-cod"
            type="radio"
            name="payment"
            value="cod"
            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
            required
          />
        </div>
        <span className="font-bold text-slate-900 dark:text-white block mb-1">
          {t('Pages.Checkout.CashOnDelivery')}
        </span>
        <span className="text-sm text-slate-500 line-clamp-2">
          Pay at your doorstep when your supplies arrive.
        </span>
      </label>

      <label
        htmlFor="payment-card"
        className={`relative flex cursor-pointer flex-col p-6 rounded-2xl border-2 transition-all ${
          paymentMethod === 'card'
            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hover:border-primary/50'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`flex size-10 items-center justify-center rounded-full ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <input
            id="payment-card"
            type="radio"
            name="payment"
            value="card"
            className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
            checked={paymentMethod === 'card'}
            onChange={() => setPaymentMethod('card')}
            required
          />
        </div>
        <span className="font-bold text-slate-900 dark:text-white block mb-1">
          {t('Pages.Checkout.CardPayment')}
        </span>
        <span className="text-sm text-slate-500 line-clamp-2">
          Securely pay online with your credit or debit card.
        </span>
      </label>
    </fieldset>
  );
}
