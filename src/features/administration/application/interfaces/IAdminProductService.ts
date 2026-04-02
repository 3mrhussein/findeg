/**
 * Admin Product Service Interface
 *
 * Defines full product lifecycle operations for the admin dashboard.
 * Includes variant-aware mutations, SKU validation, and UoM management.
 */

import type { Product } from "@/features/catalog/domain/entities/Product";
import type { ProductInput } from "@/features/administration/domain/types";
import type { Locale } from "@/features/core/domain/value-objects";
import type {
  CreateProductWithVariantsInput,
  UpdateProductWithVariantsInput,
  UoMInput,
  ImageInput,
  CreateVariantInput,
} from "@/features/administration/domain/types/VariantInput";
import type { VariantDimension } from "@/features/catalog/domain/types/VariantDimension";
import type {
  Variant,
  VariantImage,
  VariantAttributeValue,
  SellableUom,
  PriceListEntry,
} from "@/features/catalog/domain/entities/Variant";
import type { Tag } from "@/features/catalog/domain/entities/Tag";

export interface ProductListFilters {
  search?: string;
  categoryIds?: number[];
  brandIds?: number[];
  status?: "active" | "inactive";
  completeness?: "complete" | "no-category" | "no-images" | "no-price" | "draft";
  sortBy?: "name" | "price" | "stock" | "updatedAt";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ProductListItem {
  id: number;
  sku: string;
  localizedName: { en: string; ar: string };
  categoryId: number | null;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  defaultVariantPrice: number | null;
  totalStock: number;
  isActive: boolean;
  hasImages: boolean;
  updatedAt: Date;
  variantCount: number;
  thumbnailUrl: string | null;
  completeness: "complete" | "no-category" | "no-images" | "no-price" | "draft";
}

export interface ProductListResult {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductEditData extends Product {
  variants: (Variant & {
    images: VariantImage[];
    attributes: VariantAttributeValue[];
    sellableUoms: (SellableUom & {
      priceLists: PriceListEntry[];
    })[];
  })[];
  tags: Tag[];
}

export interface IAdminProductService {
  // ─── Read ──────────────────────────────────────────────────────────────────

  /** Retrieves all products for administrative listing with filters, sort, and pagination. */
  getProductsList(filters: ProductListFilters): Promise<ProductListResult>;

  /** Retrieves all products for administrative listing (Legacy). */
  getAll(language?: Locale): Promise<Product[]>;

  /** Retrieves a single product by ID. */
  getById(id: number, language?: Locale): Promise<Product | null>;

  /** Counts total products in the system. */
  count(): Promise<number>;

  // ─── Mutation ──────────────────────────────────────────────────────────────

  /** Creates a new product shell with variants in a single transaction. */
  createProduct(
    input: CreateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<{ productId: number }>;

  /** Updates an existing product and its variants. */
  updateProduct(
    id: number,
    input: UpdateProductWithVariantsInput,
    adminUserId?: number,
  ): Promise<void>;

  /** Duplicates an existing product and its variants. */
  duplicateProduct(id: number, adminUserId?: number): Promise<{ newId: number }>;

  /** Permanently deletes a product and all its variants (use with caution). */
  deleteProduct(id: number, adminUserId?: number): Promise<void>;

  /** Deactivates a variant without deleting it (safe for variants with order history). */
  deactivateVariant(variantId: number, adminUserId?: number): Promise<void>;

  // ─── Bulk Mutations ─────────────────────────────────────────────────────────

  /** Activates multiple products at once. */
  bulkActivate(ids: number[], adminUserId?: number): Promise<void>;

  /** Deactivates multiple products at once. */
  bulkDeactivate(ids: number[], adminUserId?: number): Promise<void>;

  /** Deletes multiple products at once. */
  bulkDelete(ids: number[], adminUserId?: number): Promise<void>;

  // ─── Variant Generation ────────────────────────────────────────────────────

  /**
   * Generates and persists all variant combinations from a set of dimensions.
   * Applies default pricing / UoM to each generated variant.
   */
  generateVariants(
    productId: number,
    dimensions: VariantDimension[],
    defaults: Partial<CreateVariantInput>,
    adminUserId?: number,
  ): Promise<number[]>; // returns new variant IDs

  /** Rebuilds variant keys for all variants of a product (after attribute changes). */
  rebuildVariantKeys(productId: number, adminUserId?: number): Promise<void>;

  // ─── SKU Validation ────────────────────────────────────────────────────────

  /** Checks whether a variant SKU is available (not taken by another variant). */
  checkSkuAvailable(sku: string, excludeVariantId?: number): Promise<boolean>;

  // ─── UoM & Pricing ────────────────────────────────────────────────────────

  /**
   * Replaces UoM definitions for a variant.
   * Idempotent — safe to call multiple times.
   */
  upsertVariantUoMs(variantId: number, uoms: UoMInput[], adminUserId?: number): Promise<void>;

  /** Replaces image list for a variant. */
  upsertVariantImages(variantId: number, images: ImageInput[], adminUserId?: number): Promise<void>;

  // ─── Fetch for Edit ────────────────────────────────────────────────────────

  /**
   * Retrieves full product data for the edit form.
   * Includes variants, images, UoMs, price lists, and tags.
   */
  getProductForEdit(id: number): Promise<ProductEditData | null>;

  /** Checks whether a product slug is available. */
  checkSlugAvailable(slug: string, excludeProductId?: number): Promise<boolean>;

  /** Checks whether a product SKU prefix is available. */
  checkSkuPrefixAvailable(prefix: string, excludeProductId?: number): Promise<boolean>;

  // ─── Legacy compatibility (used by import workflows) ──────────────────────

  /** @deprecated Use createProduct() instead. */
  create(input: ProductInput, adminUserId?: number): Promise<Product>;

  /** @deprecated Use updateProduct() instead. */
  update(id: number, input: ProductInput, adminUserId?: number): Promise<Product>;

  /** @deprecated Use deleteProduct() instead. */
  delete(id: number, adminUserId?: number): Promise<void>;
}
