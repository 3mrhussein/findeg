"use client";

interface OrderSummaryProps {
  orderSummary: {
    subtotal: number;
    shippingCost: number;
    total: number;
    currency: string;
  };
  cartItemsCount: number;
  t: any;
}

/**
 *
 */
export function OrderSummary({ orderSummary, cartItemsCount, t }: OrderSummaryProps) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col gap-6 sticky top-24">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        {t("Pages.Checkout.OrderSummary")}
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t("Pages.Checkout.Items")}</span>
          <span className="font-medium text-slate-900 dark:text-white">{cartItemsCount}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t("Pages.Checkout.Subtotal")}</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {orderSummary.currency} {orderSummary.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t("Pages.Checkout.Shipping")}</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {orderSummary.currency} {orderSummary.shippingCost.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

      <div className="flex justify-between items-end">
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {t("Pages.Checkout.Total")}
        </span>
        <span className="text-3xl font-black tracking-tight text-primary">
          {orderSummary.currency} {orderSummary.total.toFixed(2)}
        </span>
      </div>

      <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 mt-2">
        <div className="flex gap-3 text-primary">
          <span className="material-symbols-outlined shrink-0 text-[20px]">verified_user</span>
          <p className="text-xs font-medium leading-relaxed">
            Your payment is secure. We never store your full card details and transmit all data over
            encrypted SSL connection.
          </p>
        </div>
      </div>
    </div>
  );
}
