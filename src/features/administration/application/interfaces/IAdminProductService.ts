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

export interface IAdminProductService {
  // ─── Read ──────────────────────────────────────────────────────────────────

  /** Retrieves all products for administrative listing. */
  getAll(language?: Locale): Promise<Product[]>;

  /** Retrieves a single product by ID. */
  getById(id: number, language?: Locale): Promise<Product | null>;

  /** Retrieves a product including all its translations for editing. */
  getByIdWithTranslations(id: number): Promise<(ProductInput & { id: number }) | null>;

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

  /** Permanently deletes a product and all its variants (use with caution). */
  deleteProduct(id: number, adminUserId?: number): Promise<void>;

  /** Deactivates a variant without deleting it (safe for variants with order history). */
  deactivateVariant(variantId: number, adminUserId?: number): Promise<void>;

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

  // ─── Legacy compatibility (used by import workflows) ──────────────────────

  /** @deprecated Use createProduct() instead. */
  create(input: ProductInput, adminUserId?: number): Promise<Product>;

  /** @deprecated Use updateProduct() instead. */
  update(id: number, input: ProductInput, adminUserId?: number): Promise<Product>;

  /** @deprecated Use deleteProduct() instead. */
  delete(id: number, adminUserId?: number): Promise<void>;
}
