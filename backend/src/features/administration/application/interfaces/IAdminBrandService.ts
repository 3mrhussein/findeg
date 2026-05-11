import type { Brand } from '@findeg/backend/features/catalog/domain/entities/Brand';
import type { BrandInput } from '../../../catalog/application/dtos/BrandInput';

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

  /**
   * Checks if a slug is available.
   */
  checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean>;

  /**
   * Toggles the active status of a brand.
   */
  toggleBrandStatus(id: number): Promise<Brand>;

  /**
   * Gets the number of products associated with a brand.
   */
  getBrandProductCount(id: number): Promise<number>;
}
