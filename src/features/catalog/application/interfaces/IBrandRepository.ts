import { ID, Slug } from "@/features/core/domain/types/common";
import type { Brand } from "@/features/catalog/domain/entities/Brand";

/** Input for creating a brand */
export interface BrandCreateInput {
  slug: Slug;
  name: string;
  logoUrl?: string | null;
  isActive?: boolean;
}

/** Input for updating a brand */
export interface BrandUpdateInput {
  slug?: Slug;
  name?: string;
  logoUrl?: string | null;
  isActive?: boolean;
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
  getAll(activeOnly?: boolean): Promise<Brand[]>;

  /**
   * Retrieves a single brand by its unique identifier.
   */
  getById(id: ID): Promise<Brand | null>;

  /**
   * Retrieves a brand by its URL-friendly slug.
   */
  getBySlug(slug: Slug): Promise<Brand | null>;

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
}
