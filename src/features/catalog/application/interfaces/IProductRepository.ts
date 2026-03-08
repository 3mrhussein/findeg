/**
 * Product Repository Interface (SPU Level)
 *
 * Defines the contract for product (SPU) data access.
 * Variant-specific operations (pricing, UOMs) have been extracted to IVariantRepository.
 * Inventory operations have been extracted to IInventoryRepository.
 */

import { type ID, type Quantity, type Slug } from "@/features/core/domain/types/common";
import type { Locale } from "@/features/core/domain/value-objects";
import type { Product } from "../../domain/entities/Product";
import type { ProductInput } from "@/features/administration/domain/types";
import type { TagGroup } from "../../domain/entities/Tag";
import type { AttributeFilter } from "./IAttributeRepository";

/**
 * Product filtering options for advanced search and categorization.
 */
export interface ProductFilters {
  categoryId?: ID;
  brandId?: ID;
  /** Filters on the default variant's base_price */
  minPrice?: number;
  /** Filters on the default variant's base_price */
  maxPrice?: number;
  isActive?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "rating";
  tagIds?: ID[];
  tagGroups?: TagGroup[];
  attributeFilters?: AttributeFilter[];
  collectionId?: ID;
  productIds?: ID[];
}

/**
 * Product Repository Interface
 *
 * Defines the contract for product data access across all layers.
 * Products are returned with hydrated variants (images, attributes, UOMs, prices, inventory).
 */
export interface IProductRepository {
  /** Retrieves a single product by ID with hydrated variants */
  getById(id: ID, language?: Locale): Promise<Product | null>;

  /** Retrieves a single product by localized slug with hydrated variants */
  getBySlug(slug: Slug, language?: Locale): Promise<Product | null>;

  /** Retrieves all products */
  getAll(language?: Locale): Promise<Product[]>;

  /** Retrieves featured products */
  getFeatured(limit?: number, language?: Locale): Promise<Product[]>;

  /** Retrieves products belonging to a category subtree */
  getByCategory(categoryId: ID, language?: Locale): Promise<Product[]>;

  /** Retrieves products belonging to a specific brand */
  getByBrand(brandId: ID, language?: Locale): Promise<Product[]>;

  /** Performs full-text search across product name and description */
  search(query: string, language?: Locale): Promise<Product[]>;

  /** Retrieves a paginated list of products matching the given filters */
  getFiltered(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }>;

  /** Persists a new product (SPU) with its variants to the database */
  create(input: ProductInput): Promise<Product>;

  /** Updates an existing product's details, translations, and variants */
  update(id: ID, input: ProductInput): Promise<Product>;

  /** Removes a product and cascading variants from the database */
  delete(id: ID): Promise<void>;

  /** Counts the total number of products matching the given filters */
  count(filters?: ProductFilters): Promise<number>;

  /** Retrieves raw product data including all translations for administrative forms */
  getByIdWithTranslations(id: ID): Promise<(ProductInput & { id: ID }) | null>;
}
