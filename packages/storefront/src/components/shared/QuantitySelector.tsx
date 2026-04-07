"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@ui";
import { IconTooltip } from "@ui";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

/**
 *
 */
export function QuantitySelector({ quantity, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  /**
   *
   */
  const decrease = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  /**
   *
   */
  const increase = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full h-14 bg-white dark:bg-slate-900 px-1">
      <IconTooltip label="Decrease quantity" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={decrease}
          disabled={quantity <= min}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </IconTooltip>
      <span className="w-12 flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white">
        {quantity}
      </span>
      <IconTooltip label="Increase quantity" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={increase}
          disabled={quantity >= max}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </IconTooltip>
    </div>
  );
}
