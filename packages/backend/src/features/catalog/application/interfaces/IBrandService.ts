import { ID, Slug } from "@features/core/domain/types/common";
import type { Brand } from "@features/catalog/domain/entities/Brand";
import type { Locale } from "@features/core/domain/value-objects";

export interface IBrandService {
  getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]>;
  getById(id: ID, language?: Locale): Promise<Brand | null>;
  getBySlug(slug: Slug, language?: Locale): Promise<Brand | null>;
}
