import type { Brand } from "@/features/catalog/domain/entities/Brand";
import type { BrandInput } from "@/features/administration/domain/types";

export interface IAdminBrandService {
  /**
   * Retrieves all brands.
   */
  getAll(activeOnly?: boolean): Promise<Brand[]>;

  /**
   * Retrieves a single brand by ID.
   */
  getById(id: number): Promise<Brand | null>;

  /**
   * Creates a new brand.
   */
  create(input: BrandInput): Promise<Brand>;

  /**
   * Updates an existing brand.
   */
  update(id: number, input: BrandInput): Promise<Brand>;

  /**
   * Deletes a brand.
   */
  delete(id: number): Promise<void>;
}
