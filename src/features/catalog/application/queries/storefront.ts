import { cacheLife, cacheTag } from "next/cache";
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
 * Cached storefront read model for home page content.
 */
export async function getHomePageData(language: string): Promise<HomePageData> {
  "use cache";

  cacheLife("hours");
  cacheTag(CACHE_TAGS.CATALOG_PRODUCTS, CACHE_TAGS.CATALOG_CATEGORIES);

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
 * Storefront read model for shop listing page.
 * Kept uncached so newly created/admin-updated products reflect immediately.
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
 * Cached storefront read model for categories page.
 */
export async function getCategoriesPageData(language: string): Promise<Category[]> {
  "use cache";

  cacheLife("days");
  cacheTag(CACHE_TAGS.CATALOG_CATEGORIES);

  const locale = resolveLocale(language);
  const { categories } = getServices();
  return categories.getAll(locale);
}

/**
 * Storefront read model for search page results.
 * Kept uncached to avoid stale strict/fallback search behavior.
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
 * Cached list of product IDs used for static params generation.
 */
export async function getProductIdsForStaticParams(): Promise<number[]> {
  "use cache";

  cacheLife("days");
  cacheTag(CACHE_TAGS.CATALOG_PRODUCTS);

  const { products } = getServices();
  const allProducts = await products.getAll("en");
  return allProducts.map((product) => product.id);
}

/**
 * Cached storefront read model for product detail page.
 */
export async function getProductDetailPageData(
  productId: number,
  language: string,
): Promise<ProductDetailPageData | null> {
  "use cache";

  cacheLife("hours");
  cacheTag(CACHE_TAGS.CATALOG_PRODUCTS, CACHE_TAGS.CATALOG_REVIEWS);

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
