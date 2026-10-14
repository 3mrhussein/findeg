import { brandQueries } from '@findeg/db/queries';
import { ID, Slug } from '@findeg/db/types';
import { Brand } from '../catalog-brand/index';
import { asTranslationMap, pick } from '../../helpers/index';
import { DEFAULT_LOCALE, type Locale } from '@findeg/domain';
import { BrandCreateInput, BrandUpdateInput } from '../catalog-i-brand-repository/types';
import { IBrandService } from '../catalog-i-brand-service/types';

export class BrandService implements IBrandService {
  /**
   * Map database row to domain entity with i18n support
   */
  private mapToDomain(
    dbBrand: brandQueries.BrandRow & { productCount?: number },
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

  async getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]> {
    const rows = await brandQueries.getAll();
    const visible = activeOnly ? rows.filter((row) => row.isActive) : rows;
    return visible.map((row) => this.mapToDomain(row, language));
  }

  async getById(id: ID, language?: Locale): Promise<Brand | null> {
    const row = await brandQueries.getById(id);
    return row ? this.mapToDomain(row, language) : null;
  }

  async getBySlug(slug: Slug, language?: Locale): Promise<Brand | null> {
    const row = await brandQueries.getBySlug(slug);
    return row ? this.mapToDomain(row, language) : null;
  }

  async create(input: BrandCreateInput): Promise<Brand> {
    const row = await brandQueries.create(input);
    return this.mapToDomain(row);
  }

  async update(id: ID, input: BrandUpdateInput): Promise<Brand> {
    const row = await brandQueries.update(id, input);
    return this.mapToDomain(row);
  }

  async delete(id: ID): Promise<void> {
    return brandQueries.deleteById(id);
  }

  async toggleBrandStatus(id: number): Promise<Brand> {
    const brand = await this.getById(id);
    if (!brand) throw new Error('Brand not found');
    const row = await brandQueries.update(id, { isActive: !brand.isActive });
    return this.mapToDomain(row);
  }
}
