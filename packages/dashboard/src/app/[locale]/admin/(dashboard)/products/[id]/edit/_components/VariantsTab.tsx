/**
 * VariantsTab — Variants management tab for edit form
 *
 * Contains VariantsZone (variant generation, SKU management, pricing per variant)
 *
 * Location: src/app/[locale]/admin/(dashboard)/products/[id]/edit/_components/
 */

"use client";

import * as React from "react";
import { VariantsZone } from "../../../_components/ProductForm/zones/VariantsZone";

/**
 * VariantsTab — Variant management
 */
export function VariantsTab() {
  return (
    <div className="space-y-6">
      <VariantsZone />
    </div>
  );
}
