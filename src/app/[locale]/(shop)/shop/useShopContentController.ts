"use client";

import { useState } from "react";
import type { SortOption, ViewMode } from "@/lib/types";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { usePagination } from "@/hooks";
import { useProducts } from "@/hooks/useProducts";

interface UseShopContentControllerResult {
  viewMode: ViewMode;
  sortOption: SortOption;
  sortedProducts: Product[];
  currentProducts: Product[];
  currentPage: number;
  totalPages: number;
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (value: SortOption) => void;
  setCurrentPage: (page: number) => void;
  handleFilterChange: (newFilteredProducts: Product[]) => void;
}

/**
 * Encapsulates shop page listing/filter/sort/pagination behavior.
 */
export function useShopContentController(products: Product[]): UseShopContentControllerResult {
  const { sortedProducts, sortOption, setSortOption, setFilteredProducts } = useProducts(products);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const {
    currentPage,
    totalPages,
    currentPageData: currentProducts,
    setCurrentPage,
  } = usePagination(sortedProducts, 8);

  /**
   * Applies filtered list from sidebar to listing state.
   */
  const handleFilterChange = (newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  };

  return {
    viewMode,
    sortOption,
    sortedProducts,
    currentProducts,
    currentPage,
    totalPages,
    setViewMode,
    setSortOption,
    setCurrentPage,
    handleFilterChange,
  };
}
