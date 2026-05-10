import { ID, Slug } from '@findeg/backend/features/core/domain/types/common';
import type { Brand } from '@findeg/backend/features/catalog/domain/entities/Brand';
import type { Locale } from '@findeg/backend/features/core/domain/value-objects';

import {
  BrandCreateInput,
  BrandUpdateInput,
} from './IBrandRepository';

export interface IBrandService {
  getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]>;
  getById(id: ID, language?: Locale): Promise<Brand | null>;
  getBySlug(slug: Slug, language?: Locale): Promise<Brand | null>;

  create(input: BrandCreateInput): Promise<Brand>;
  update(id: number, input: BrandUpdateInput): Promise<Brand>;
  delete(id: number): Promise<void>;
  toggleBrandStatus(id: number): Promise<Brand>;
}
