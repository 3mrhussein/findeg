import { ID, Slug } from "@findeg/backend/features/core/domain/types/common";
import type { Brand } from "@findeg/backend/features/catalog/domain/entities/Brand";
import type { Locale } from "@findeg/backend/features/core/domain/value-objects";

/** Input for creating a brand */
export interface BrandCreateInput {
  slug: Slug;
  name: string;
  logoUrl?: string | null;
  isActive?: boolean;
  localizedName?: Record<string, string>;
  localizedDescription?: Record<string, string>;
}

/** Input for updating a brand */
export interface BrandUpdateInput {
  slug?: Slug;
  name?: string;
  logoUrl?: string | null;
  isActive?: boolean;
  localizedName?: Record<string, string>;
  localizedDescription?: Record<string, string>;
}

/**
 * Brand Repository Interface
 *
 * Defines the contract for product brand/manufacturer data access.
 */
export interface IBrandRepository {
  /**
   * Retrieves all brands.
   *
   * @param activeOnly - If true, returns only active brands.
   */
  getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]>;

  /**
   * Retrieves a single brand by its unique identifier.
   */
  getById(id: ID, language?: Locale): Promise<Brand | null>;

  /**
   * Retrieves a brand by its URL-friendly slug.
   */
  getBySlug(slug: Slug, language?: Locale): Promise<Brand | null>;

  /**
   * Persists a new brand to storage.
   */
  create(data: BrandCreateInput): Promise<Brand>;

  /**
   * Updates an existing brand's information.
   */
  update(id: ID, data: BrandUpdateInput): Promise<Brand>;

  /**
   * Removes a brand from storage.
   */
  delete(id: ID): Promise<void>;

  /**
   * Counts the total number of brands in the system.
   */
  count(): Promise<number>;

  /**
   * Counts products by brand ID.
   */
  countProductsByBrandId(id: ID): Promise<number>;
}
