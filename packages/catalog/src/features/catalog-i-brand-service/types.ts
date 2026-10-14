import { ID, Slug } from '@findeg/db/types';
import type { Brand } from '../catalog-brand/index';
import type { Locale } from '@findeg/domain';

import { BrandCreateInput, BrandUpdateInput } from '../catalog-i-brand-repository/types';

export interface IBrandService {
  getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]>;
  getById(id: ID, language?: Locale): Promise<Brand | null>;
  getBySlug(slug: Slug, language?: Locale): Promise<Brand | null>;

  create(input: BrandCreateInput): Promise<Brand>;
  update(id: number, input: BrandUpdateInput): Promise<Brand>;
  delete(id: number): Promise<void>;
  toggleBrandStatus(id: number): Promise<Brand>;
}
