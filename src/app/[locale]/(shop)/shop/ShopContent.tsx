"use client";

import React, { useState } from "react";
import { products as allProducts } from "@/lib/constants";
import type { SortOption, ViewMode } from "@/lib/types";
import type { Product } from "@/domain/entities/Product";
import { Grid } from "@/components/layout/Grid";
import { ProductCard } from "../_components/ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { useTranslations } from "next-intl";
import { usePagination } from "@/hooks";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ProductListItem } from "@/components/common/ProductListItem";
import { Pagination } from "@/components/common/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/common/Icon";

/**
 *
 */
export const ShopContent: React.FC = () => {
  const t = useTranslations();
  const { sortedProducts, sortOption, setSortOption, setFilteredProducts } =
    useProducts(allProducts);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const {
    currentPage,
    totalPages,
    currentPageData: currentProducts,
    setCurrentPage,
  } = usePagination(sortedProducts, 8);

  const sortOptions = [
    { value: "featured", label: t("Pages.Shop.SortFeatured") },
    { value: "newest", label: t("Pages.Shop.SortNewest") },
    { value: "price-asc", label: t("Pages.Shop.SortPriceAsc") },
    { value: "price-desc", label: t("Pages.Shop.SortPriceDesc") },
  ];

  /**
   *
   */
  const handleFilterChange = (newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
      <div className="hidden lg:block lg:w-1/4 xl:w-1/5 lg:sticky lg:top-28 self-start">
        <FilterSidebar allProducts={allProducts} onFilterChange={handleFilterChange} />
      </div>

      <div className="w-full">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full lg:hidden mb-6">
              {t("Pages.Shop.FiltersTitle")}
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{t("Pages.Shop.FiltersTitle")}</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <FilterSidebar allProducts={allProducts} onFilterChange={handleFilterChange} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Sort and View Options */}
        <Card className="flex flex-wrap gap-4 justify-between items-center mb-6 p-4">
          <p className="text-muted-foreground text-sm">
            {t("Pages.Shop.ShowingResults", {
              count: sortedProducts.length,
              total: allProducts.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger className="w-48" aria-label={t("Pages.Shop.SortBy")}>
                <SelectValue placeholder={t("Pages.Shop.SortBy")} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Icon name="grid" className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <Icon name="list" className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Products */}
        {currentProducts.length > 0 ? (
          viewMode === "grid" ? (
            <Grid>
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Grid>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <Card className="text-center py-16">
            <p className="text-muted-foreground">{t("Pages.Shop.NoProducts")}</p>
          </Card>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
