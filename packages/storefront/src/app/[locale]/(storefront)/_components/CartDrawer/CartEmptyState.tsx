"use client";

import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

/**
 * Empty cart view — shown when cartItems is empty.
 */
export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
      <div className="flex size-24 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
          shopping_cart
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Your cart is empty
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px] mx-auto">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
      </div>
      <SheetClose asChild>
        <Button
          variant="outline"
          className="mt-4 rounded-full border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Continue Shopping
        </Button>
      </SheetClose>
    </div>
  );
}
