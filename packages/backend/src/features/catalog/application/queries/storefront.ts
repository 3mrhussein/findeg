import { getServices } from "@/server/getServices";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Category } from "@/features/catalog/domain/entities/Category";
import type { Review } from "@/features/review/domain/entities/Review";
import { fuzzySearchProducts } from "@/features/catalog/application/utils/fuzzy-search";
import { resolveLocale, type Locale } from "@/features/core/domain/value-objects";

export interface HomePageData {
  featuredProducts: Product[];
  categories: Category[];
}

export interface ShopPageData {
  products: Product[];
}

export interface SearchPageData {
  query: string;
  products: Product[];
  mode: "exact" | "fallback" | "empty";
  exactCount: number;
}

export interface ProductDetailPageData {
  product: Product;
  reviews: Review[];
  recommendedProducts: Product[];
}

/**
 * Cached storefront read model for the home page.
 *
 * Uses `'use cache'` with the `hours` profile:
 *   stale: 5 min | revalidate: 1 hr | expire: 1 day
 *
 * Tagged with both products + categories so admin writes to either
 * collection can bust this entry via `revalidateTag`.
 *
 * @param language - Locale string (e.g. "en" | "ar"). Must be passed explicitly
 *   so it becomes part of the cache key — one entry per locale.
 */
export async function getHomePageData(language: string): Promise<HomePageData> {
  const locale = resolveLocale(language);
  const { products, categories } = getServices();
  const [featuredProducts, allCategories] = await Promise.all([
    products.getFeaturedProducts(8, locale),
    categories.getAll(locale),
  ]);

  return {
    featuredProducts,
    categories: allCategories,
  };
}

/**
 * Cached storefront read model for the shop listing page.
 *
 * Uses `'use cache'` with the `hours` profile. The full product list is
 * cached; runtime filter/sort logic in `getShopPageViewModel` operates
 * on this cached data without hitting the database again.
 *
 * @param language - Locale string. Part of the cache key.
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  const locale = resolveLocale(language);
  const { products } = getServices();
  const allProducts = await products.getAll(locale);

  return {
    products: allProducts,
  };
}

/**
 * Storefront read model for the search page.
 *
 * Intentionally NOT cached — search results are query-dependent and must
 * reflect the latest product data on every request.
 *
 * @param language - Locale string.
 * @param query    - Raw search query from the user.
 */
export async function getSearchPageData(language: string, query: string): Promise<SearchPageData> {
  const locale = resolveLocale(language);
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return {
      query: normalizedQuery,
      products: [],
      mode: "empty",
      exactCount: 0,
    };
  }

  const { products } = getServices();
  const strictResults = await products.searchProducts(normalizedQuery, locale);
  if (strictResults.length > 0) {
    return {
      query: normalizedQuery,
      products: strictResults,
      mode: "exact",
      exactCount: strictResults.length,
    };
  }

  const allProducts = await products.getAll(locale);
  const fallbackResults = fuzzySearchProducts(allProducts, normalizedQuery);

  return {
    query: normalizedQuery,
    products: fallbackResults,
    mode: fallbackResults.length > 0 ? "fallback" : "empty",
    exactCount: 0,
  };
}

/**
 * Cached list of all product IDs used by `generateStaticParams`.
 *
 * Uses `'use cache'` with the `days` profile — static params are rebuilt
 * infrequently and can tolerate a longer revalidation window.
 */
export async function getProductIdsForStaticParams(): Promise<number[]> {
  // "use cache"; // TODO: Re-enable after proper cache configuration
  // cacheTag(CACHE_TAGS.CATALOG_PRODUCTS);
  // cacheLife("days");

  const { products } = getServices();
  const allProducts = await products.getAll("en");
  return allProducts.map((product) => product.id);
}

/**
 * Cached storefront read model for the product detail page.
 *
 * Uses `'use cache'` with two tags:
 *   - Collection tag: busted when any product changes (admin writes).
 *   - Entity tag: busted surgically for this specific product only.
 *
 * @param productId - Numeric product ID. Part of the cache key.
 * @param language  - Locale string. Part of the cache key.
 */
export async function getProductDetailPageData(
  productId: number,
  language: string,
): Promise<ProductDetailPageData | null> {
  // "use cache"; // TODO: Re-enable after proper cache configuration
  // cacheTag(CACHE_TAGS.CATALOG_PRODUCTS, CACHE_TAGS.productDetail(productId));
  // cacheLife("hours");

  const locale: Locale = resolveLocale(language);
  const { products, repositories } = getServices();
  const product = await products.getById(productId, locale);

  if (!product) return null;

  const [allProducts, reviews] = await Promise.all([
    products.getAll(locale),
    repositories.reviews.getByProductId(productId),
  ]);

  const recommendedProducts = allProducts
    .filter(
      (candidate) => candidate.id !== product.id && candidate.categoryId === product.categoryId,
    )
    .slice(0, 4);

  return {
    product,
    reviews,
    recommendedProducts,
  };
}

/**
 * Cached storefront read model for the categories listing page.
 *
 * Uses `'use cache'` with the `days` profile — categories change
 * less frequently than products.
 *
 * @param language - Locale string. Part of the cache key.
 */
export async function getCategoriesPageData(language: string): Promise<Category[]> {
  // "use cache"; // TODO: Re-enable after proper cache configuration
  // cacheTag(CACHE_TAGS.CATALOG_CATEGORIES);
  // cacheLife("days");

  const locale = resolveLocale(language);
  const { categories } = getServices();
  return categories.getAll(locale);
}
