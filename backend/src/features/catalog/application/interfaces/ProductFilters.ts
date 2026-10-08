import type { ProductListingSort } from '@findeg/db/queries';
import { type ID } from '@findeg/backend/features/core/domain/types/common';
import type { TagGroup } from '../../domain/entities/Tag';
import type { AttributeFilter } from './IAttributeRepository';

export interface ProductFilters {
  categoryId?: ID;
  brandId?: ID;
  /** Matches products of any of these brands */
  brandIds?: ID[];
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
  sort?: ProductListingSort;
  tagIds?: ID[];
  tagGroups?: TagGroup[];
  attributeFilters?: AttributeFilter[];
  collectionId?: ID;
  productIds?: ID[];
}
