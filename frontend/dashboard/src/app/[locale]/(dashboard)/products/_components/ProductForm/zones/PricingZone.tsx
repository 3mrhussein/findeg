"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { InfoIcon } from "lucide-react";
import { PriceInput } from "../shared/PriceInput";

interface PricingZoneProps {
  /** When true, shows a per-variant warning if switching pricing mode */
  hasVariants?: boolean;
  variantIndex?: number;
}

/**
 * PricingZone — Zone 3
 *
 * Handles:
 * - Pricing mode toggle (shared all-variants vs per-variant)
 * - Base price, strike price, cost price inputs
 */
export function PricingZone({ hasVariants, variantIndex }: PricingZoneProps) {
  const { watch, setValue } = useFormContext();

  const pricingMode = watch("pricingMode");
  const isShared = pricingMode === "shared";

  // Field prefix logic
  const isTopLevelPricing = variantIndex === undefined;

  /**
   *
   */
  const getFieldName = (suffix: string) => {
    if (isShared && isTopLevelPricing) {
      return `shared${suffix}`;
    }

    // If we are at top level but NOT in shared mode (and hasVariants is false)
    // we should point to the first variant's pricing
    const idx = variantIndex !== undefined ? variantIndex : 0;
    const lowerSuffix = suffix.charAt(0).toLowerCase() + suffix.slice(1);
    return `variants.${idx}.${lowerSuffix}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pricing mode toggle — only at SPU level */}
        {isTopLevelPricing && hasVariants && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pricing Mode
            </Label>
            <div className="flex gap-4">
              {(["shared", "per-variant"] as const).map((mode) => (
                <label key={mode} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="pricingMode"
                    value={mode}
                    checked={pricingMode === mode}
                    onChange={() => setValue("pricingMode", mode)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span className="text-sm">
                    {mode === "shared"
                      ? "Same price for all variants"
                      : "Different price per variant"}
                  </span>
                </label>
              ))}
            </div>

            {isShared && (
              <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-800 dark:bg-blue-950/30">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  A single price will be applied to all variants. Switching to per-variant mode will
                  require you to set price for each variant individually.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Price fields */}
        <div className="grid grid-cols-3 gap-3">
          <PriceInput name={getFieldName("BasePrice")} label="Base Price" required />
          <PriceInput
            name={getFieldName("StrikePrice")}
            label="Original Price"
            hint="Shown as strikethrough"
          />
          <PriceInput name={getFieldName("CostPrice")} label="Cost Price" hint="Internal only" />
        </div>
      </CardContent>
    </Card>
  );
}
