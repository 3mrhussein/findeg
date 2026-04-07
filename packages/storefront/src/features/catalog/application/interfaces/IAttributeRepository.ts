/**
 * Attribute Repository Interface
 */

import { ID } from "@features/core/domain/types/common";
import {
  AttributeDefinition,
  CreateAttributeDefinition,
  ProductAttributeValue,
} from "../../domain/entities/AttributeDefinition";

export interface AttributeFilter {
  attributeKey: string;
  operator: "eq" | "lt" | "lte" | "gt" | "gte" | "in";
  value: string | number | boolean | string[];
}

export interface IAttributeRepository {
  /** Retrieves all available attribute definitions */
  getAllDefinitions(): Promise<AttributeDefinition[]>;

  /** Retrieves definitions marked as filterable */
  getFilterableDefinitions(): Promise<AttributeDefinition[]>;

  /** Creates a new attribute definition */
  createDefinition(input: CreateAttributeDefinition): Promise<AttributeDefinition>;

  /** Updates an existing definition */
  updateDefinition(id: ID, input: Partial<CreateAttributeDefinition>): Promise<AttributeDefinition>;

  /** Deletes an attribute definition */
  deleteDefinition(id: ID): Promise<void>;

  /** Retrieves all attribute values for a specific product */
  getProductAttributes(productId: ID): Promise<ProductAttributeValue[]>;

  /** Bulk sets attribute values for a product */
  setProductAttributes(productId: ID, values: ProductAttributeValue[]): Promise<void>;

  /** Returns IDs of products matching a set of attribute filters */
  getMatchedProductIds(filters: AttributeFilter[]): Promise<ID[]>;
}
