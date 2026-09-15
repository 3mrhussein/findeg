import { type ID } from '@findeg/backend/features/core/domain/types/common';
import type { TagGroup } from '../../domain/entities/Tag';
import type { AttributeFilter } from './IAttributeRepository';

export interface ProductFilters {
  categoryId?: ID;
  brandId?: ID;
  /** Filters on the default variant's base_price */
  minPrice?: number;
  /** Filters on the default variant's base_price */
  maxPrice?: number;
  isActive?: boolean;
  onSale?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  tagIds?: ID[];
  tagGroups?: TagGroup[];
  attributeFilters?: AttributeFilter[];
  collectionId?: ID;
  productIds?: ID[];
}
