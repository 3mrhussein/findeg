/**
 * PricingTab — Pricing and UoMs tab for edit form
 *
 * Contains PricingZone (units of measure, price lists)
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 */

"use client";

import * as React from "react";
import { PricingZone } from "../../../_components/ProductForm/zones/PricingZone";

/**
 * PricingTab — Pricing and units of measure
 */
export function PricingTab() {
  return (
    <div className="space-y-6">
      <PricingZone />
    </div>
  );
}
