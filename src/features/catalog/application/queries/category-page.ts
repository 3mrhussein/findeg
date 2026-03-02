import { getServices } from "@/server/getServices";
import { resolveLocale } from "@/features/core/domain/value-objects";
import { Product } from "@/features/catalog/domain/entities/Product";
import { Category } from "@/features/catalog/domain/entities/Category";
import {
  applyListingFilters,
  buildBrandOptions,
  buildCategoryTree,
  FilterOption,
  CategoryFilterOption,
  getPriceBounds,
  parseListingFilters,
} from "./listing";

export interface CategoryPageViewModel {
  category: Category;
  products: Product[];
  filteredProducts: Product[];
  categoryOptions: CategoryFilterOption[];
  brandOptions: FilterOption[];
  minPrice: number;
  maxPrice: number;
}

/**
 * Builds the view model for the Category Detail page.
 */
export async function getCategoryPageViewModel(
  slug: string,
  locale: string,
  query: { [key: string]: string | string[] | undefined },
): Promise<CategoryPageViewModel | null> {
  const resolvedLocale = resolveLocale(locale);
  const { categories, products } = getServices();

  const category = await categories.getBySlug(slug, resolvedLocale);
  if (!category) return null;

  const [categoryProducts, allCategories] = await Promise.all([
    products.getByCategory(category.id, resolvedLocale),
    categories.getAll(resolvedLocale),
  ]);

  const { minPrice, maxPrice } = getPriceBounds(categoryProducts);
  const categoryOptions = buildCategoryTree(allCategories, categoryProducts);
  const brandOptions = buildBrandOptions(categoryProducts);
  const filters = parseListingFilters(query, [minPrice, maxPrice]);

  const filtered = applyListingFilters({
    products: categoryProducts,
    categories: allCategories,
    filters,
  });

  return {
    category,
    products: categoryProducts,
    filteredProducts: filtered,
    categoryOptions,
    brandOptions,
    minPrice,
    maxPrice,
  };
}
