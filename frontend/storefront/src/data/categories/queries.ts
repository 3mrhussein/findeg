/**
 * Categories Data Layer (Storefront)
 *
 * Provides cached data for the storefront category features.
 * Adheres to Next.js 16 "use cache" standards.
 */
"use cache";

import { cacheTag, cacheLife } from "next/cache";
import { createCatalogServices } from "@findeg/backend/features/catalog";
import { parse } from "@findeg/backend/features/core";
import { mapProduct, mapCategoryOptions, mapBrandOptions } from "../helpers/mappers";
import { ShopPlpViewModel } from "../catalog/types";

/**
 * Category Page Data
 */
export async function getCategoryPageViewModel(
  slug: string,
  locale: string,
  query: any,
): Promise<ShopPlpViewModel | null> {
  const resolvedLocale = parse(locale);
  cacheTag("categories", `category-${resolvedLocale}-${slug}`);
  cacheLife("hours");

  const {
    categories: categoryService,
    products: productService,
    brands: brandService,
  } = createCatalogServices();

  const category = await categoryService.getBySlug(slug, resolvedLocale);
  if (!category) return null;

  const products = await productService.getByCategory(category.id, resolvedLocale);
  const mappedProducts = products.map((p) => mapProduct(p, resolvedLocale));

  return {
    category: category as any,
    products: mappedProducts,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {},
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(await brandService.getAll(true, resolvedLocale), {}),
    minPriceBound: 0,
    maxPriceBound: 1000,
    facetCounts: {
      categories: {},
      brands: {},
      ratings: {},
      discounts: {
        onSale: 0,
        bundleDeals: 0,
      },
    },
    total: products.length,
    totalPages: 1,
    page: 1,
    perPage: mappedProducts.length,
    from: 1,
    to: mappedProducts.length,
    locale: resolvedLocale,
    query: query?.q || "",
    categorySlugPath: [],
    filters: {
      minPrice: 0,
      maxPrice: 1000,
      brandIds: [],
      inStockOnly: false,
      discounts: [],
    },
    sort: "newest",
  };
}

/**
 * Categories List Data (with counts)
 */
export async function getCategoriesPageData(language: string): Promise<any[]> {
  const resolvedLocale = parse(language);
  cacheTag("categories", `categories-${resolvedLocale}`);
  cacheLife("days");

  const { categories: categoryService } = createCatalogServices();
  return await categoryService.getAll(resolvedLocale);
}

/**
 * Get all active categories for navigation
 */
export async function getNavCategories(language: string) {
  const locale = parse(language);
  const { categories } = createCatalogServices();

  cacheTag("categories", `nav-categories-${locale}`);
  cacheLife("days");

  const all = await categories.getAll(locale);
  return all.filter((c) => c.isActive !== false);
}
