"use client";

import { useMemo } from "react";
import type { Product } from "@/features/catalog/domain/entities/Product";

export type SelectedVariantMap = Record<string, string>;

/**
 * Derives the first in-stock variant option per variant group.
 */
export function useDefaultVariantSelection(product: Product): SelectedVariantMap | undefined {
  return useMemo(() => {
    if (!product.variants) {
      return undefined;
    }

    const selectedVariant = Object.keys(product.variants).reduce<SelectedVariantMap>((acc, key) => {
      const firstAvailableOption = product.variants?.[key]?.options.find((opt) => opt.stock > 0);
      if (firstAvailableOption) {
        acc[key] = firstAvailableOption.value;
      }
      return acc;
    }, {});

    return Object.keys(selectedVariant).length > 0 ? selectedVariant : undefined;
  }, [product.variants]);
}
