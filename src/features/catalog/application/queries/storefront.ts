import { cacheLife, cacheTag } from "next/cache";
import { getServices } from "@/server/getServices";
import { CACHE_TAGS } from "@/features/core/domain/constants/cache-tags";
import type { Product } from "@/features/catalog/domain/entities/Product";
import type { Category } from "@/features/catalog/domain/entities/Category";
import type { Review } from "@/features/review/domain/entities/Review";

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

  const { products, categories } = getServices();
  const [featuredProducts, allCategories] = await Promise.all([
    products.getFeaturedProducts(8, language),
    categories.getAll(language),
  ]);

  return {
    featuredProducts,
    categories: allCategories,
  };
}

/**
 * Cached storefront read model for shop listing page.
 */
export async function getShopPageData(language: string): Promise<ShopPageData> {
  "use cache";

  cacheLife("hours");
  cacheTag(CACHE_TAGS.CATALOG_PRODUCTS);

  const { products } = getServices();
  const allProducts = await products.getAll(language);

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

  const { categories } = getServices();
  return categories.getAll(language);
}

/**
 * Cached storefront read model for search page results.
 */
export async function getSearchPageData(language: string, query: string): Promise<SearchPageData> {
  "use cache";

  cacheLife("minutes");
  cacheTag(CACHE_TAGS.CATALOG_PRODUCTS);

  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return {
      query: normalizedQuery,
      products: [],
    };
  }

  const { products } = getServices();
  const results = await products.searchProducts(normalizedQuery, language);
  return {
    query: normalizedQuery,
    products: results,
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

  const { products, repositories } = getServices();
  const product = await products.getById(productId, language);

  if (!product) return null;

  const [allProducts, reviews] = await Promise.all([
    products.getAll(language),
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
