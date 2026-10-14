import type { ProductListingSort } from '@findeg/db/queries';
import { type ID } from '@findeg/db/types';
import type { TagGroup } from '../catalog-tag/index';
import type { AttributeFilter } from '../catalog-i-attribute-repository/types';

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
