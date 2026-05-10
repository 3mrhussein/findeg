import type {
  Product as BaseProduct,
  Variant as BaseVariant,
  Brand as BaseBrand,
  Category as BaseCategory,
  Collection as BaseCollection,
} from '@findeg/backend/features/catalog/domain';
import type { Review as BaseReview } from '@findeg/backend/features/review/domain/entities/Review';

export interface Product extends Omit<BaseProduct, 'variants'> {
  slug: string;
  brandName?: string;
  categoryName?: string;
  variants?: Variant[];
  isNew?: boolean;
}

export interface Variant extends BaseVariant {
  inventory?: {
    onHand: number;
    reserved: number;
    warehouseId?: number;
    warehouseCode?: string;
  }[];
}

export type Brand = BaseBrand;
export type Category = BaseCategory;
export type Collection = BaseCollection;
export type Review = BaseReview;

/**
 * Filter Types
 */
export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  isSelected?: boolean;
}

export type ShopPlpDiscount = 'on-sale' | 'bundle-deals';

export interface ShopPlpFilters {
  query?: string;
  minPrice: number;
  maxPrice: number;
  brandIds: number[];
  ratingMin?: number;
  inStockOnly: boolean;
  discounts: ShopPlpDiscount[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ShopPlpFacetCounts {
  categories: Record<string, number>;
  brands: Record<string, number>;
  ratings: Record<number, number>;
  discounts: {
    onSale: number;
    bundleDeals: number;
  };
}

export interface CategoryFilterOption extends FilterOption {
  parentId: string | number | null;
  slug: string;
  children?: CategoryFilterOption[];
}

/**
 * Review Types
 */
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  histogram: Record<number, number>;
}

/**
 * Shared Listing View Model Base
 */
export type ShopPlpSort = 'popular' | 'newest' | 'price-low-high' | 'price-high-low' | 'rating';

export interface BaseListingViewModel {
  products: Product[];
  filteredProducts?: Product[];
  categoryOptions: CategoryFilterOption[];
  brandOptions: FilterOption[];
  minPriceBound: number;
  maxPriceBound: number;
  facetCounts: ShopPlpFacetCounts;
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  from: number;
  to: number;
  locale: string;
}

/**
 * Product Listing Page (PLP) View Model
 */
export interface ShopPlpViewModel extends BaseListingViewModel {
  query: string;
  category?: Category | null;
  currentCategoryName?: string;
  categorySlugPath: string[];
  filters: ShopPlpFilters;
  sort: ShopPlpSort;
}

/**
 * Search Page View Model
 */
export interface SearchPageViewModel extends ShopPlpViewModel {
  mode: 'search' | 'fallback';
  query: string;
  exactCount: boolean;
}

/**
 * Collection Page View Model
 */
export interface CollectionPageViewModel extends BaseListingViewModel {
  collection: Collection;
  categorySlugPath: string[];
  filters: ShopPlpFilters;
  sort: ShopPlpSort;
}

/**
 * Product Detail Page (PDP) View Model
 */
export interface ProductPdpViewModel {
  product: Product;
  selectedVariant: Variant | null;
  canonicalSlug: string;
  brand: Brand | null;
  categories: Category[];
  relatedProducts: Product[];
  reviewSummary: ReviewSummary;
  initialReviews: Review[];
  reviewTotal: number;
  shouldRedirect: boolean;
  canonicalPath: string;
  stockSnapshot: {
    inStock: boolean;
    quantity: number;
  };
  breadcrumbs: { label: string; href?: string }[];
}

/**
 * Home Page Data
 */
export interface HomePageData {
  featuredProducts: Product[];
  heroProducts: Product[];
  categories: Category[];
  collections: Collection[];
}

/**
 * Shop Listing Page Data (Simplified)
 */
export interface ShopPageData {
  products: Product[];
  categories: Category[];
  total: number;
}

/**
 * Product Detail Page Data (Simplified)
 */
export interface ProductDetailPageData {
  product: Product;
  relatedProducts: Product[];
  reviewSummary: ReviewSummary;
  initialReviews: Review[];
  reviewTotal: number;
}

/**
 * Collections Page Data
 */
export interface CollectionsPageData {
  collections: Collection[];
  trendingCategories: Category[];
}
