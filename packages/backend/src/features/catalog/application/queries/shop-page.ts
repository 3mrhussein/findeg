import { cacheTag, cacheLife } from "next/cache";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import { getServices } from "@/server/getServices";
import { getShopPageData } from "./storefront";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { FilterOption } from "./listing";
import {
  applyListingFilters,
  buildBrandOptions,
  buildCategoryTree,
  getPriceBounds,
  parseListingFilters,
  type CategoryFilterOption,
} from "./listing";
import { resolveLocale } from "@/features/core/domain/value-objects";

export interface ShopPageViewModel {
  products: Product[];
  filteredProducts: Product[];
  categoryOptions: CategoryFilterOption[];
  brandOptions: FilterOption[];
  minPrice: number;
  maxPrice: number;
}

/**
 * Builds server-side shop page view model with filters and sorted product results.
 */
export async function getShopPageViewModel(
  locale: string,
  query: { [key: string]: string | string[] | undefined },
): Promise<ShopPageViewModel> {
  const resolvedLocale = resolveLocale(locale);
  const { categories } = getServices();
  const [shopData, allCategories] = await Promise.all([
    getShopPageData(resolvedLocale),
    categories.getAll(resolvedLocale),
  ]);

  const products = shopData.products;
  const { minPrice, maxPrice } = getPriceBounds(products);

  const categoryOptions = buildCategoryTree(allCategories, products);
  const brandOptions = buildBrandOptions(products);

  const filters = parseListingFilters(query, [minPrice, maxPrice]);
  const filtered = applyListingFilters({
    products,
    categories: allCategories,
    filters,
  });

  return {
    products,
    filteredProducts: filtered,
    categoryOptions,
    brandOptions,
    minPrice,
    maxPrice,
  };
}
