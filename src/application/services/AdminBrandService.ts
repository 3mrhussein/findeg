import { IAdminBrandService } from "@/application/services/interfaces/IAdminBrandService";
import { IBrandRepository } from "@/application/repositories/IBrandRepository";
import { Brand } from "@/infrastructure/database/schema/brands";
import { AdminBrandInput } from "@/domain/types/admin";
import { IAuditLogService } from "@/application/services/interfaces/IAuditLogService";

/**
 * Admin Brand Service
 *
 * Handles brand CRUD operations for the admin dashboard.
 * Manages brand metadata including logos and active status.
 */
export class AdminBrandService implements IAdminBrandService {
  /**
   * Creates an instance of AdminBrandService
   *
   * @param brandRepository - Brand data access layer
   * @param auditLogService - Audit logging service for tracking changes
   */
  constructor(
    private brandRepository: IBrandRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves all brands
   *
   * @param activeOnly - If true, returns only active brands
   * @returns Array of brand entities
   */
  async getAll(activeOnly: boolean = false): Promise<Brand[]> {
    return this.brandRepository.getAll(activeOnly);
  }

  /**
   * Retrieves a brand by ID
   *
   * @param id - Brand ID
   * @returns Brand entity or null if not found
   */
  async getById(id: number): Promise<Brand | null> {
    return this.brandRepository.getById(id);
  }

  /**
   * Creates a new brand
   *
   * @param input - Brand data including slug, name, logo URL, and active status
   * @returns Created brand entity
   */
  async create(input: AdminBrandInput): Promise<Brand> {
    const brand = await this.brandRepository.create({
      slug: input.slug,
      name: input.name,
      logoUrl: input.logoUrl,
      isActive: input.isActive ?? true,
    });

    // Audit Log could be added here if we had user context, but typically service method calls come from API handlers where we have user info.
    // However, if we want to log here, we need adminUserId passed in.
    // For now, we'll assume the controller handles logging or we'll update signature later.
    // Actually, let's keep it simple for now and rely on repository/controller orchestration or add logging later.

    return brand;
  }

  /**
   * Updates an existing brand
   *
   * @param id - Brand ID to update
   * @param input - Updated brand data
   * @returns Updated brand entity
   */
  async update(id: number, input: AdminBrandInput): Promise<Brand> {
    const brand = await this.brandRepository.update(id, {
      slug: input.slug,
      name: input.name,
      logoUrl: input.logoUrl,
      isActive: input.isActive,
    });
    return brand;
  }

  /**
   * Deletes a brand
   *
   * @param id - Brand ID to delete
   */
  async delete(id: number): Promise<void> {
    await this.brandRepository.delete(id);
  }
}
