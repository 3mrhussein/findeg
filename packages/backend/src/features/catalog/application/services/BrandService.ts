import { ID, Slug } from "@backend/features/core/domain/types/common";
import { Brand } from "@backend/features/catalog/domain/entities/Brand";
import { Locale } from "@backend/features/core/domain/value-objects";
import { IBrandRepository } from "../interfaces/IBrandRepository";
import { IBrandService } from "../interfaces/IBrandService";

export class BrandService implements IBrandService {
  constructor(private readonly brandRepository: IBrandRepository) {}

  async getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]> {
    return this.brandRepository.getAll(activeOnly, language);
  }

  async getById(id: ID, language?: Locale): Promise<Brand | null> {
    return this.brandRepository.getById(id, language);
  }

  async getBySlug(slug: Slug, language?: Locale): Promise<Brand | null> {
    return this.brandRepository.getBySlug(slug, language);
  }
}
