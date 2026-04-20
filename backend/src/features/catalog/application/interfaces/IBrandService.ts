import { ID, Slug } from "@findeg/backend/features/core/domain/types/common";
import type { Brand } from "@findeg/backend/features/catalog/domain/entities/Brand";
import type { Locale } from "@findeg/backend/features/core/domain/value-objects";

export interface IBrandService {
  getAll(activeOnly?: boolean, language?: Locale): Promise<Brand[]>;
  getById(id: ID, language?: Locale): Promise<Brand | null>;
  getBySlug(slug: Slug, language?: Locale): Promise<Brand | null>;
}
