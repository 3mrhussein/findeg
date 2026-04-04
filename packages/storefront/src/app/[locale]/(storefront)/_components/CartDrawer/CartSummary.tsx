"use client";

import Link from "next/link";
import { Button } from "@findeg/ui";
import { Separator } from "@findeg/ui";
import { SheetClose, SheetFooter } from "@findeg/ui";
import { useTranslations } from "next-intl";

const egpFormatter = new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP" });

interface CartSummaryProps {
  cartTotal: number;
}

/**
 * Cart footer — subtotal, shipping notice, total, and checkout CTA.
 */
export function CartSummary({ cartTotal }: CartSummaryProps) {
  const t = useTranslations();

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50">
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {egpFormatter.format(cartTotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Shipping</span>
          <span className="text-slate-900 dark:text-white">Calculated at checkout</span>
        </div>
        <Separator className="dark:bg-slate-800" />
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-slate-900 dark:text-white">
            {t("Pages.Checkout.Total")}
          </span>
          <span className="text-2xl font-black text-primary">{egpFormatter.format(cartTotal)}</span>
        </div>
      </div>

      <SheetFooter>
        <SheetClose asChild>
          <Link href="/checkout" className="w-full">
            <Button className="w-full h-14 text-lg font-bold rounded-full shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {t("Pages.Cart.Checkout")}
            </Button>
          </Link>
        </SheetClose>
      </SheetFooter>
    </div>
  );
}
