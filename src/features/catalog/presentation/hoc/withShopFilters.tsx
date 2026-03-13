"use client";

import type React from "react";
import { useShopFilters } from "@/features/catalog/presentation/hooks/useShopFilters";

type FilterState = ReturnType<typeof useShopFilters>;
type InjectedShopFilterProps = Pick<
  FilterState,
  | "selectedCategories"
  | "selectedBrands"
  | "localPrice"
  | "setLocalPrice"
  | "setPriceRange"
  | "setCategory"
  | "setBrand"
  | "clearFilters"
>;

interface WithShopFilterBounds {
  minPrice: number;
  maxPrice: number;
}

export function withShopFilters<P extends object>(
  Component: React.ComponentType<P & InjectedShopFilterProps>,
) {
  return function ShopFiltersBoundComponent(props: P & WithShopFilterBounds) {
    const { minPrice, maxPrice, ...restProps } = props;
    const filterState = useShopFilters({
      minPrice,
      maxPrice,
    });

    const injected: InjectedShopFilterProps = {
      selectedCategories: filterState.selectedCategories,
      selectedBrands: filterState.selectedBrands,
      localPrice: filterState.localPrice,
      setLocalPrice: filterState.setLocalPrice,
      setPriceRange: filterState.setPriceRange,
      setCategory: filterState.setCategory,
      setBrand: filterState.setBrand,
      clearFilters: filterState.clearFilters,
    };

    return <Component {...(restProps as P)} {...injected} />;
  };
}
