import { createCatalogServices } from "../services/factory";
import { createReviewServices } from "@findeg/backend/features/review";
import type { Product } from "@findeg/backend/features/catalog/domain/entities/Product";
import type { Category } from "@findeg/backend/features/catalog/domain/entities/Category";
import type { Collection } from "@findeg/backend/features/catalog/domain/entities/Collection";
import type { Review } from "@findeg/backend/features/review/domain/entities/Review";
import { fuzzySearchProducts } from "@findeg/backend/features/catalog/application/utils/fuzzy-search";
import { resolveLocale, type Locale } from "@findeg/backend/features/core/domain/value-objects";

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

export interface CollectionsPageData {
  collections: Collection[];
  trendingCategories: Category[];
}

export interface ProductDetailPageData {
  product: Product;
  reviews: Review[];
  recommendedProducts: Product[];
}

/**
 * Storefront read model for the home page.
 *
 * @param language - Locale string (e.g. "en" | "ar").
 */
export async function getHomePageData(language: string): Promise<HomePageData> {
  const locale = resolveLocale(language);
  const { products, categories } = createCatalogServices();
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
 * Storefront read model for the shop listing page.
 *
 * @param language - Locale string.
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  const locale = resolveLocale(language);
  const { products } = createCatalogServices();
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

  const { products } = createCatalogServices();
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
 * List of all product IDs used by `generateStaticParams`.
 */
export async function getProductIdsForStaticParams(): Promise<number[]> {
  const { products } = createCatalogServices();
  const allProducts = await products.getAll("en");
  return allProducts.map((product) => product.id);
}

/**
 * Storefront read model for the product detail page.
 *
 * @param productId - Numeric product ID.
 * @param language  - Locale string.
 */
export async function getProductDetailPageData(
  productId: number,
  language: string,
): Promise<ProductDetailPageData | null> {
  const locale: Locale = resolveLocale(language);
  const { products } = createCatalogServices();
  const { reviews: reviewService } = createReviewServices();
  const product = await products.getById(productId, locale);

  if (!product) return null;

  const [allProducts, reviewResult] = await Promise.all([
    products.getAll(locale),
    reviewService.getProductReviews(productId),
  ]);

  const recommendedProducts = allProducts
    .filter(
      (candidate: Product) =>
        candidate.id !== product.id && candidate.categoryId === product.categoryId,
    )
    .slice(0, 4);

  return {
    product,
    reviews: reviewResult.reviews,
    recommendedProducts,
  };
}

/**
 * Storefront read model for the categories listing page.
 *
 * @param language - Locale string.
 */
export async function getCategoriesPageData(language: string): Promise<any[]> {
  const locale = resolveLocale(language);
  const { categories, products } = createCatalogServices();
  const [allCategories, allProducts] = await Promise.all([
    categories.getAll(locale),
    products.getAll(locale),
  ]);

  return allCategories
    .filter((c) => c.isActive !== false)
    .map((c) => {
      const productsCount = allProducts.filter((p) => p.categoryId === c.id).length;
      return { ...c, productsCount };
    });
}

/**
 * Storefront read model for the collections listing page.
 *
 * @param language - Locale string.
 */
export async function getCollectionsPageData(language: string): Promise<CollectionsPageData> {
  const locale = resolveLocale(language);
  const { collections: collectionService, categories: categoriesService } = createCatalogServices();
  const [collections, categories] = await Promise.all([
    collectionService.getAllCollections(),
    categoriesService.getAll(locale),
  ]);

  return {
    collections,
    trendingCategories: categories.filter((c) => c.isActive !== false).slice(0, 4),
  };
}
