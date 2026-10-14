'use cache';

import 'server-only';
/**
 * Categories Data Layer (Storefront)
 *
 * Provides cached data for the storefront category features.
 * Adheres to Next.js 16 "use cache" standards.
 */

import { cacheTag, cacheLife } from 'next/cache';
import { createCategoryService, createProductService, createBrandService } from '@findeg/catalog';
import { parse } from '@findeg/catalog';
import { mapCategoryOptions, mapBrandOptions } from '../helpers/mappers';
import { ShopPlpViewModel } from '../catalog/types';
import { mapProductsWithInventory } from '../catalog/inventory';
import { parseShopPlpQuery } from '../catalog/plp-query';

/**
 * Category Page Data
 */
export async function getCategoryPageViewModel(
  slug: string,
  locale: string,
  query: Record<string, string | string[] | undefined>,
): Promise<ShopPlpViewModel | null> {
  const resolvedLocale = parse(locale);
  cacheTag('categories', `category-${resolvedLocale}-${slug}`);
  cacheLife('hours');

  const categoryService = createCategoryService();
  const productService = createProductService();
  const brandService = createBrandService();

  const category = await categoryService.getBySlug(slug, resolvedLocale);
  if (!category) return null;

  const listing = parseShopPlpQuery(query);
  const offset = (listing.page - 1) * listing.perPage;
  const result = await productService.getFilteredProducts(
    {
      limit: listing.perPage,
      offset,
      isActive: true,
      categoryId: category.id,
      brandIds: listing.brandIds,
      minPrice: listing.minPrice,
      maxPrice: listing.maxPrice,
      sort: listing.backendSort,
    },
    resolvedLocale,
  );

  const mappedProducts = await mapProductsWithInventory(result.products, resolvedLocale);
  const priceBounds = await productService.getPriceBounds(category.id);

  return {
    category: category,
    currentCategoryName: category.name,
    products: mappedProducts,
    categoryOptions: mapCategoryOptions(
      await categoryService.getTree(resolvedLocale),
      {},
      resolvedLocale,
    ),
    brandOptions: mapBrandOptions(await brandService.getAll(true, resolvedLocale), {}),
    minPriceBound: priceBounds.minPrice,
    maxPriceBound: priceBounds.maxPrice,
    facetCounts: {
      categories: {},
      brands: {},
      ratings: {},
      discounts: {
        onSale: 0,
        bundleDeals: 0,
      },
    },
    total: result.total,
    totalPages: Math.ceil(result.total / listing.perPage),
    page: listing.page,
    perPage: listing.perPage,
    from: mappedProducts.length > 0 ? offset + 1 : 0,
    to: mappedProducts.length > 0 ? offset + mappedProducts.length : 0,
    locale: resolvedLocale,
    query: String(query?.q || ''),
    categorySlugPath: [category.slug],
    filters: {
      minPrice: listing.minPrice ?? priceBounds.minPrice,
      maxPrice: listing.maxPrice ?? priceBounds.maxPrice,
      brandIds: listing.brandIds,
      inStockOnly: query?.inStock === 'true',
      discounts: [],
    },
    sort: listing.sort,
  };
}

/**
 * Categories List Data (with counts)
 */
export async function getCategoriesPageData(
  language: string,
): Promise<(import('@findeg/catalog').Category & { productsCount?: number })[]> {
  const resolvedLocale = parse(language);
  cacheTag('categories', `categories-${resolvedLocale}`);
  cacheLife('days');

  const categoryService = createCategoryService();
  const categories = await categoryService.getAll(resolvedLocale);
  return categories.map((c) => ({
    ...c,
    productsCount: c.productCount ?? 0,
  }));
}

/**
 * Get all active categories for navigation
 */
export async function getNavCategories(language: string) {
  const locale = parse(language);
  const categories = createCategoryService();

  cacheTag('categories', `nav-categories-${locale}`);
  cacheLife('days');

  const all = await categories.getAll(locale);
  return all.filter((c) => c.isActive !== false);
}
