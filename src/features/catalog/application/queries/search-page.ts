import { getServices } from "@/server/getServices";
import { getSearchPageData } from "./storefront";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { FilterOption } from "./listing";
import {
  applyListingFilters,
  buildBrandOptions,
  buildCategoryOptions,
  getPriceBounds,
  parseListingFilters,
} from "./listing";
import { resolveLocale } from "@/features/core/domain/value-objects";

export interface SearchPageViewModel {
  query: string;
  products: Product[];
  filteredProducts: Product[];
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  minPrice: number;
  maxPrice: number;
  mode: "exact" | "fallback" | "empty";
  exactCount: number;
}

/**
 * Builds server-side search page view model with listing filters/sorting.
 */
export async function getSearchPageViewModel(
  locale: string,
  rawQuery: string,
  query: { [key: string]: string | string[] | undefined },
): Promise<SearchPageViewModel> {
  const resolvedLocale = resolveLocale(locale);
  const { categories } = getServices();
  const [searchData, allCategories] = await Promise.all([
    getSearchPageData(resolvedLocale, rawQuery),
    categories.getAll(resolvedLocale),
  ]);

  const products = searchData.products;
  const { minPrice, maxPrice } = getPriceBounds(products);

  const filters = parseListingFilters(query, [minPrice, maxPrice]);
  const filteredProducts = applyListingFilters({
    products,
    categories: allCategories,
    filters,
  });

  return {
    query: searchData.query,
    products,
    filteredProducts,
    categoryOptions: buildCategoryOptions(allCategories, products),
    brandOptions: buildBrandOptions(products),
    minPrice,
    maxPrice,
    mode: searchData.mode,
    exactCount: searchData.exactCount,
  };
}
