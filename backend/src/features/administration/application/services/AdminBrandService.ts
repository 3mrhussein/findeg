import { ID, Slug } from '../../../core/domain/types/common';
import { IAdminBrandService } from '../interfaces/IAdminBrandService';
import { Brand } from '../../../catalog/domain/entities/Brand';
import { BrandInput } from '../../../catalog/application/dtos/BrandInput';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import {
  getAllBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  countBrands,
  countProductsByBrandId,
} from '@findeg/db/queries';
import { DEFAULT_LOCALE, asTranslationMap, type Locale, pick } from '../../../core/domain/value-objects';

/**
 * Admin Brand Service
 *
 * Handles brand CRUD operations for the admin dashboard.
 * Manages brand metadata including logos and active status.
 * Uses query primitives instead of repository pattern.
 */
export class AdminBrandService implements IAdminBrandService {
  /**
   * Maps raw database brand to domain entity.
   */
  private mapToDomain(dbBrand: any, language: Locale = DEFAULT_LOCALE): Brand {
    const localizedName = asTranslationMap(dbBrand.localizedName);
    const localizedDescription = asTranslationMap(dbBrand.localizedDescription || {});

    return {
      id: dbBrand.id,
      slug: dbBrand.slug as Slug,
      localizedName,
      localizedDescription,
      name: pick(localizedName, language),
      description: pick(localizedDescription, language),
      locale: language,
      logoUrl: dbBrand.logoUrl,
      isActive: dbBrand.isActive,
      productCount: (dbBrand as any).productCount as number | undefined,
      createdAt: dbBrand.createdAt,
      updatedAt: dbBrand.updatedAt,
    };
  }

  /**
   * Creates an instance of AdminBrandService.
   *
   * @param auditLogService - Service for tracking changes to brand records.
   */
  constructor(private auditLogService?: IAuditLogService) { }

  /**
   * Retrieves all brands.
   *
   * @param activeOnly - If true, filtering for only active brands.
   * @returns List of brands.
   */
  async getAll(activeOnly: boolean = false): Promise<Brand[]> {
    const brands = await getAllBrands();
    return brands.map((b) => this.mapToDomain(b));
  }

  /**
   * Retrieves a single brand by its ID.
   *
   * @param id - Brand ID.
   * @returns The brand if it exists.
   */
  async getById(id: ID): Promise<Brand | null> {
    const brand = await getBrandById(id as number);
    return brand ? this.mapToDomain(brand) : null;
  }

  /**
   * Creates a new manufacturer brand.
   *
   * @param input - The brand details (name, slug, logo).
   * @returns The created brand.
   */
  async create(input: BrandInput): Promise<Brand> {
    const brand = await createBrand({
      slug: input.slug as Slug,
      logoUrl: input.logoUrl,
      localizedName: { en: input.nameEn!, ar: input.nameAr! },
      localizedDescription: { en: input.descriptionEn || '', ar: input.descriptionAr || '' },
    });

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'brand',
        entityId: String(brand.id),
        action: 'create',
        adminUserId: undefined,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return this.mapToDomain(brand);
  }

  /**
   * Updates an existing brand's properties.
   *
   * @param id - The ID of the brand to update.
   * @param input - Updated fields.
   * @returns The updated brand.
   */
  async update(id: ID, input: BrandInput): Promise<Brand> {
    const existing = await getBrandById(id as number);
    if (!existing) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    const brand = await updateBrand(id as number, {
      slug: input.slug as Slug,
      logoUrl: input.logoUrl,
      localizedName: { en: input.nameEn!, ar: input.nameAr! },
      localizedDescription: { en: input.descriptionEn || '', ar: input.descriptionAr || '' },
    });

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'brand',
        entityId: String(id),
        action: 'update',
        adminUserId: undefined,
        oldValues: existing as unknown as Record<string, unknown>,
        newValues: input as unknown as Record<string, unknown>,
      });
    }

    return this.mapToDomain(brand);
  }

  /**
   * Permanently removes a brand from the repository.
   *
   * @param id - Brand unique ID.
   */
  async delete(id: ID): Promise<void> {
    const existing = await getBrandById(id as number);
    if (!existing) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    await deleteBrand(id as number);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'brand',
        entityId: String(id),
        action: 'delete',
        adminUserId: undefined,
        oldValues: existing as unknown as Record<string, unknown>,
      });
    }
  }

  /**
   * Checks if a slug is available.
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await getBrandBySlug(slug as Slug);
    if (!existing) return true;
    return existing.id === excludeId;
  }

  /**
   * Toggles the active status.
   */
  async toggleBrandStatus(id: ID): Promise<Brand> {
    const brand = await this.getById(id);
    if (!brand) throw new Error('Brand not found');
    return this.update(id, {
      slug: brand.slug,
      nameEn: brand.localizedName?.en || brand.name,
      nameAr: brand.localizedName?.ar || brand.name,
      descriptionEn: brand.localizedDescription?.en || '',
      descriptionAr: brand.localizedDescription?.ar || '',
      isActive: !brand.isActive,
    } as unknown as BrandInput);
  }

  /**
   * Gets product count.
   */
  async getBrandProductCount(id: ID): Promise<number> {
    return countProductsByBrandId(id as number);
  }
}
