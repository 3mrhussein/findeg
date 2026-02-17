"use client";

import React from "react";
import type { Product } from "@/features/catalog/domain/entities/Product";
import { useTranslations } from "next-intl";
import { useShopContentController } from "./useShopContentController";
import { ShopContentView } from "./ShopContentView";
import type { SortOption } from "@/lib/types";

/**
 *
 */
export const ShopContent: React.FC<{ products: Product[] }> = ({ products }) => {
  const t = useTranslations();
  const {
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
  } = useShopContentController(products);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured", label: t("Pages.Shop.SortFeatured") },
    { value: "newest", label: t("Pages.Shop.SortNewest") },
    { value: "price-asc", label: t("Pages.Shop.SortPriceAsc") },
    { value: "price-desc", label: t("Pages.Shop.SortPriceDesc") },
  ];

  return (
    <ShopContentView
      products={products}
      sortedProducts={sortedProducts}
      currentProducts={currentProducts}
      sortOption={sortOption}
      viewMode={viewMode}
      sortOptions={sortOptions}
      filtersTitle={t("Pages.Shop.FiltersTitle")}
      sortByLabel={t("Pages.Shop.SortBy")}
      showingResultsLabel={t("Pages.Shop.ShowingResults", {
        count: sortedProducts.length,
        total: products.length,
      })}
      noProductsLabel={t("Pages.Shop.NoProducts")}
      gridViewLabel={t("Pages.Shop.GridView")}
      listViewLabel={t("Pages.Shop.ListView")}
      onFilterChange={handleFilterChange}
      onSortChange={setSortOption}
      onViewModeChange={setViewMode}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};
