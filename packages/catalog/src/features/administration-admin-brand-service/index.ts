import { ID } from '@findeg/db/types';
import { IAdminBrandService } from '../administration-i-admin-brand-service/types';
import { Brand } from '../catalog-brand/index';
import { BrandInput } from '../catalog-brand-input/index';
import { IAuditLogService } from '../administration-i-audit-log-service/types';
import {
  getAllBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  countProductsByBrandId,
} from '@findeg/db/queries';
import {
  DEFAULT_LOCALE,
  asTranslationMap,
  translationMapBy,
  type Locale,
  pick,
} from '../../helpers/index';

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
  private mapToDomain(
    dbBrand: NonNullable<Awaited<ReturnType<typeof getBrandById>>> & { productCount?: number },
    language: Locale = DEFAULT_LOCALE,
  ): Brand {
    const localizedName = asTranslationMap(dbBrand.localizedName);
    const localizedDescription = asTranslationMap(dbBrand.localizedDescription || {});

    return {
      id: dbBrand.id,
      slug: dbBrand.slug,
      localizedName,
      localizedDescription,
      name: pick(localizedName, language),
      description: pick(localizedDescription, language),
      locale: language,
      logoUrl: dbBrand.logoUrl,
      isActive: dbBrand.isActive,
      productCount: dbBrand.productCount,
      createdAt: dbBrand.createdAt,
      updatedAt: dbBrand.updatedAt,
    };
  }

  /**
   * Creates an instance of AdminBrandService.
   *
   * @param auditLogService - Service for tracking changes to brand records.
   */
  constructor(private auditLogService?: IAuditLogService) {}

  /**
   * Retrieves all brands.
   *
   * @param activeOnly - If true, filtering for only active brands.
   * @param language - Language for the resolved `name` and `description`.
   * @returns List of brands.
   */
  async getAll(_activeOnly: boolean = false, language: Locale = DEFAULT_LOCALE): Promise<Brand[]> {
    const brands = await getAllBrands();
    return brands.map((b) => this.mapToDomain(b, language));
  }

  /**
   * Retrieves a single brand by its ID.
   *
   * @param id - Brand ID.
   * @returns The brand if it exists.
   */
  async getById(id: ID): Promise<Brand | null> {
    const brand = await getBrandById(id);
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
      slug: input.slug,
      logoUrl: input.logoUrl,
      localizedName: translationMapBy((locale) => (locale === 'en' ? input.nameEn : input.nameAr)),
      localizedDescription: translationMapBy((locale) =>
        locale === 'en' ? input.descriptionEn : input.descriptionAr,
      ),
    });

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'brand',
        entityId: String(brand.id),
        action: 'create',
        adminUserId: undefined,
        newValues: input,
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
    const existing = await getBrandById(id);
    if (!existing) {
      throw new Error(`Brand with ID ${String(id)} not found`);
    }

    const brand = await updateBrand(id, {
      slug: input.slug,
      logoUrl: input.logoUrl,
      isActive: input.isActive,
      localizedName: translationMapBy((locale) => (locale === 'en' ? input.nameEn : input.nameAr)),
      localizedDescription: translationMapBy((locale) =>
        locale === 'en' ? input.descriptionEn : input.descriptionAr,
      ),
    });

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'brand',
        entityId: String(id),
        action: 'update',
        adminUserId: undefined,
        oldValues: existing,
        newValues: input,
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
    const existing = await getBrandById(id);
    if (!existing) {
      throw new Error(`Brand with ID ${String(id)} not found`);
    }

    const productCount = await countProductsByBrandId(id);
    if (productCount > 0) {
      throw new Error(`Cannot delete brand with ${String(productCount)} associated product(s)`);
    }

    await deleteBrand(id);

    if (this.auditLogService) {
      await this.auditLogService.logAction({
        entityType: 'brand',
        entityId: String(id),
        action: 'delete',
        adminUserId: undefined,
        oldValues: existing,
      });
    }
  }

  /**
   * Checks if a slug is available.
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await getBrandBySlug(slug);
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
      nameEn: brand.localizedName.en || brand.name || '',
      nameAr: brand.localizedName.ar || brand.name || '',
      descriptionEn: brand.localizedDescription?.en || '',
      descriptionAr: brand.localizedDescription?.ar || '',
      isActive: !brand.isActive,
    });
  }

  /**
   * Gets product count.
   */
  async getBrandProductCount(id: ID): Promise<number> {
    return countProductsByBrandId(id);
  }
}
