"use client";

import { useEffect, useState } from "react";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
  normalizeListingSort,
  sanitizePriceRange,
} from "@/features/catalog/application/queries/listing";

interface UseShopFiltersParams {
  minPrice?: number;
  maxPrice?: number;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)));
}

function toSanitizedPriceRange(
  values: number[],
  minPrice: number,
  maxPrice: number,
): [number, number] {
  if (values.length !== 2) return [minPrice, maxPrice];
  return sanitizePriceRange([values[0], values[1]], [minPrice, maxPrice]);
}

export function useShopFilters({ minPrice = 0, maxPrice = 1000 }: UseShopFiltersParams = {}) {
  const [selectedCategoriesQuery, setSelectedCategoriesQuery] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withOptions({ shallow: false }).withDefault([]),
  );
  const [selectedBrandsQuery, setSelectedBrandsQuery] = useQueryState(
    "brands",
    parseAsArrayOf(parseAsString).withOptions({ shallow: false }).withDefault([]),
  );
  const [priceRangeQuery, setPriceRangeQuery] = useQueryState(
    "price",
    parseAsArrayOf(parseAsInteger)
      .withOptions({ shallow: false })
      .withDefault([minPrice, maxPrice]),
  );
  const [sortQuery, setSortQuery] = useQueryState(
    "sort",
    parseAsString.withOptions({ shallow: false }).withDefault("featured"),
  );
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withOptions({ shallow: false }).withDefault(1),
  );

  const selectedCategories = unique(selectedCategoriesQuery);
  const selectedBrands = unique(selectedBrandsQuery);
  const priceRange = toSanitizedPriceRange(priceRangeQuery, minPrice, maxPrice);
  const sort = normalizeListingSort(sortQuery);
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number] | null>(null);
  const localPrice = draftPriceRange ?? priceRange;

  const setLocalPriceRange = (value: number[]) => {
    setDraftPriceRange(toSanitizedPriceRange(value, minPrice, maxPrice));
  };

  const setPriceRange = async (value: number[] | null) => {
    const nextRange =
      value && value.length === 2
        ? sanitizePriceRange([value[0], value[1]], [minPrice, maxPrice])
        : null;
    setDraftPriceRange(nextRange);
    await setPage(1);
    try {
      return await setPriceRangeQuery(nextRange);
    } finally {
      setDraftPriceRange(null);
    }
  };

  const setCategory = (id: string, checked: boolean) => {
    const current = unique(selectedCategoriesQuery);
    const next = checked ? unique([...current, id]) : current.filter((value) => value !== id);

    void setPage(1);
    void setSelectedCategoriesQuery(next.length > 0 ? next : null);
  };

  const setBrand = (id: string, checked: boolean) => {
    const current = unique(selectedBrandsQuery);
    const next = checked ? unique([...current, id]) : current.filter((value) => value !== id);

    void setPage(1);
    void setSelectedBrandsQuery(next.length > 0 ? next : null);
  };

  const setSort = (value: string) => {
    void setPage(1);
    return setSortQuery(normalizeListingSort(value));
  };

  const clearFilters = () => {
    setDraftPriceRange(null);
    void setSelectedCategoriesQuery(null);
    void setSelectedBrandsQuery(null);
    void setPriceRangeQuery(null);
    void setSortQuery(null);
    void setPage(null);
  };

  return {
    selectedCategories,
    selectedBrands,
    priceRange,
    localPrice,
    sort,
    setSort,
    setLocalPrice: setLocalPriceRange,
    setPriceRange,
    setCategory,
    setBrand,
    clearFilters,
  };
}

export function useShopSort() {
  const [sortQuery, setSortQuery] = useQueryState(
    "sort",
    parseAsString.withOptions({ shallow: false }).withDefault("featured"),
  );
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withOptions({ shallow: false }).withDefault(1),
  );
  const sort = normalizeListingSort(sortQuery);

  useEffect(() => {
    if (sortQuery !== sort) {
      void setSortQuery(sort);
    }
  }, [sortQuery, sort, setSortQuery]);

  const setSort = (value: string) => {
    void setPage(1);
    return setSortQuery(normalizeListingSort(value));
  };

  return { sort, setSort };
}
