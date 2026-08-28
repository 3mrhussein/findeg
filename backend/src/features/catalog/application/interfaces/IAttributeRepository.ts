/**
 * Attribute Repository Interface
 */

import { ID } from '@findeg/backend/features/core/domain/types/common';
import {
  Attribute,
  CreateAttribute,
  ProductAttributeValue,
} from '../../domain/entities/Attribute';

export interface AttributeFilter {
  attributeKey: string;
  operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in';
  value: string | number | boolean | string[];
}

export interface IAttributeRepository {
  /** Retrieves all available attribute definitions */
  getAllDefinitions(): Promise<Attribute[]>;

  /** Retrieves definitions marked as filterable */
  getFilterableDefinitions(): Promise<Attribute[]>;

  /** Creates a new attribute definition */
  createDefinition(input: CreateAttribute): Promise<Attribute>;

  /** Updates an existing definition */
  updateDefinition(id: ID, input: Partial<CreateAttribute>): Promise<Attribute>;

  /** Deletes an attribute definition */
  deleteDefinition(id: ID): Promise<void>;

  /** Retrieves all attribute values for a specific product */
  getProductAttributes(productId: ID): Promise<ProductAttributeValue[]>;

  /** Bulk sets attribute values for a product */
  setProductAttributes(productId: ID, values: ProductAttributeValue[]): Promise<void>;

  /** Returns IDs of products matching a set of attribute filters */
  getMatchedProductIds(filters: AttributeFilter[]): Promise<ID[]>;
}
