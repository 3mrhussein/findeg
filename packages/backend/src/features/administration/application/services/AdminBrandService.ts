import { ID, Slug } from "../../../core/domain/types/common";
import { IAdminBrandService } from "../interfaces/IAdminBrandService";
import { IBrandRepository } from "../../../catalog/application/interfaces/IBrandRepository";
import { Brand } from "../../../catalog/domain/entities/Brand";
import { BrandInput } from "../../domain/types/BrandInput";
import { IAuditLogService } from "../interfaces/IAuditLogService";

/**
 * Admin Brand Service
 *
 * Handles brand CRUD operations for the admin dashboard.
 * Manages brand metadata including logos and active status.
 */
export class AdminBrandService implements IAdminBrandService {
  /**
   * Creates an instance of AdminBrandService.
   *
   * @param brandRepository - Repository for brand data management.
   * @param auditLogService - Service for tracking changes to brand records.
   */
  constructor(
    private brandRepository: IBrandRepository,
    private auditLogService: IAuditLogService,
  ) { }

  /**
   * Retrieves all brands.
   *
   * @param activeOnly - If true, filtering for only active brands.
   * @returns List of brands.
   */
  async getAll(activeOnly: boolean = false): Promise<Brand[]> {
    return this.brandRepository.getAll(activeOnly);
  }

  /**
   * Retrieves a single brand by its ID.
   *
   * @param id - Brand ID.
   * @returns The brand if it exists.
   */
  async getById(id: ID): Promise<Brand | null> {
    return this.brandRepository.getById(id);
  }

  /**
   * Creates a new manufacturer brand.
   *
   * @param input - The brand details (name, slug, logo).
   * @returns The created brand.
   */
  async create(input: BrandInput): Promise<Brand> {
    const brand = await this.brandRepository.create({
      slug: input.slug as Slug,
      name: input.nameEn!,
      logoUrl: input.logoUrl,
      isActive: input.isActive ?? true,
      localizedName: { en: input.nameEn!, ar: input.nameAr! },
      localizedDescription: { en: input.descriptionEn || "", ar: input.descriptionAr || "" },
    });
    return brand;
  }

  /**
   * Updates an existing brand's properties.
   *
   * @param id - The ID of the brand to update.
   * @param input - Updated fields.
   * @returns The updated brand.
   */
  async update(id: ID, input: BrandInput): Promise<Brand> {
    const brand = await this.brandRepository.update(id, {
      slug: input.slug as Slug,
      name: input.nameEn,
      logoUrl: input.logoUrl,
      isActive: input.isActive,
      localizedName: { en: input.nameEn!, ar: input.nameAr! },
      localizedDescription: { en: input.descriptionEn || "", ar: input.descriptionAr || "" },
    });
    return brand;
  }

  /**
   * Permanently removes a brand from the repository.
   *
   * @param id - Brand unique ID.
   */
  async delete(id: ID): Promise<void> {
    await this.brandRepository.delete(id);
  }

  /**
   * Checks if a slug is available.
   */
  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await this.brandRepository.getBySlug(slug as Slug);
    if (!existing) return true;
    return existing.id === excludeId;
  }

  /**
   * Toggles the active status.
   */
  async toggleBrandStatus(id: ID): Promise<Brand> {
    const brand = await this.getById(id);
    if (!brand) throw new Error("Brand not found");
    return this.update(id, {
      slug: brand.slug,
      nameEn: brand.localizedContent?.name?.en || brand.name,
      nameAr: brand.localizedContent?.name?.ar || brand.name,
      descriptionEn: (brand.localizedContent as Record<string, any>)?.description?.en || "",
      descriptionAr: (brand.localizedContent as Record<string, any>)?.description?.ar || "",
      isActive: !brand.isActive,
    } as unknown as BrandInput);
  }

  /**
   * Gets product count.
   */
  async getBrandProductCount(id: ID): Promise<number> {
    return this.brandRepository.countProductsByBrandId(id);
  }
}
