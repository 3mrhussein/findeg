import { ID, Slug } from '@findeg/backend/features/core/domain/types/common';
import { Brand } from '@findeg/backend/features/catalog/domain/entities/Brand';
import { Locale } from '@findeg/backend/features/core/domain/value-objects';
import { IBrandRepository, BrandCreateInput, BrandUpdateInput } from '../interfaces/IBrandRepository';
import { IBrandService } from '../interfaces/IBrandService';

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

  async create(input: BrandCreateInput): Promise<Brand> {
    return this.brandRepository.create(input);
  }

  async update(id: ID, input: BrandUpdateInput): Promise<Brand> {
    return this.brandRepository.update(id, input);
  }

  async delete(id: ID): Promise<void> {
    return this.brandRepository.delete(id);
  }

  async toggleBrandStatus(id: number): Promise<Brand> {
    const brand = await this.brandRepository.getById(id);
    if (!brand) throw new Error('Brand not found');
    return this.brandRepository.update(id, { isActive: !brand.isActive });
  }
}
