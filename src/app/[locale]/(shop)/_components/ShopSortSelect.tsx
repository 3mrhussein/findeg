"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShopSort } from "@/features/catalog/presentation/hooks/useShopFilters";
import { LISTING_SORT_VALUES } from "@/features/catalog/application/queries/listing";

/**
 *
 */
export function ShopSortSelect() {
  const t = useTranslations();
  const { sort, setSort } = useShopSort();

  const currentSort = LISTING_SORT_VALUES.includes(sort) ? sort : "featured";

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground" htmlFor="shop-sort">
        {t("Pages.Shop.SortBy")}
      </label>
      <Select
        value={currentSort}
        onValueChange={(value) => {
          void setSort(value);
        }}
      >
        <SelectTrigger id="shop-sort" className="w-[220px]" data-testid="shop-sort-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured" data-testid="shop-sort-option-featured">
            {t("Pages.Shop.SortFeatured")}
          </SelectItem>
          <SelectItem value="price-asc" data-testid="shop-sort-option-price-asc">
            {t("Pages.Shop.SortPriceAsc")}
          </SelectItem>
          <SelectItem value="price-desc" data-testid="shop-sort-option-price-desc">
            {t("Pages.Shop.SortPriceDesc")}
          </SelectItem>
          <SelectItem value="rating-desc" data-testid="shop-sort-option-rating-desc">
            {t("Pages.Shop.SortTopRated")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
