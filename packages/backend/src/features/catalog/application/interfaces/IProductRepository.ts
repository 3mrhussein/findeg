/**
 * Product Repository Interface (SPU Level)
 *
 * Defines the contract for product (SPU) data access.
 * Variant-specific operations (pricing, UOMs) have been extracted to IVariantRepository.
 * Inventory operations have been extracted to IInventoryRepository.
 */

import { type ID, type Quantity, type Slug } from "@backend/features/core/domain/types/common";
import type { Locale } from "@backend/features/core/domain/value-objects";
import type { Product } from "../../domain/entities/Product";
import type { ProductInput } from "@backend/features/administration/domain/types";
import type { TagGroup } from "../../domain/entities/Tag";
import type { AttributeFilter } from "./IAttributeRepository";

export interface ProductFilters {
  categoryId?: ID;
  brandId?: ID;
  /** Filters on the default variant's base_price */
  minPrice?: number;
  /** Filters on the default variant's base_price */
  maxPrice?: number;
  isActive?: boolean;
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

export interface IProductRepository {
  getById(id: ID, language?: Locale): Promise<Product | null>;

  getBySlug(slug: Slug, language?: Locale): Promise<Product | null>;

  getAll(language?: Locale): Promise<Product[]>;

  getFeatured(limit?: number, language?: Locale): Promise<Product[]>;

  getByCategory(categoryId: ID, language?: Locale): Promise<Product[]>;

  getByBrand(brandId: ID, language?: Locale): Promise<Product[]>;

  search(query: string, language?: Locale): Promise<Product[]>;

  getFiltered(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }>;

  create(input: ProductInput): Promise<Product>;

  update(id: ID, input: ProductInput): Promise<Product>;

  delete(id: ID): Promise<void>;

  count(filters?: ProductFilters): Promise<number>;
}
