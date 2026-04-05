import { getServices } from "@/server/getServices";
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
 * Storefront read model for the home page.
 *
 * @param language - Locale string (e.g. "en" | "ar").
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
 * Storefront read model for the shop listing page.
 *
 * @param language - Locale string.
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
 * List of all product IDs used by `generateStaticParams`.
 */
export async function getProductIdsForStaticParams(): Promise<number[]> {
  const { products } = getServices();
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
 * Storefront read model for the categories listing page.
 *
 * @param language - Locale string.
 */
export async function getCategoriesPageData(language: string): Promise<Category[]> {
  const locale = resolveLocale(language);
  const { categories } = getServices();
  return categories.getAll(locale);
}
