/**
 * Drizzle Attribute Repository
 */

import { db } from "@/features/core/infrastructure/persistence";
import {
  attributeDefinitions,
  productAttributes,
} from "@/features/core/infrastructure/persistence/schema";
import {
  IAttributeRepository,
  AttributeFilter,
} from "../../application/interfaces/IAttributeRepository";
import {
  AttributeDefinition,
  CreateAttributeDefinition,
  ProductAttributeValue,
} from "../../domain/entities/AttributeDefinition";
import { eq, and, sql, inArray, lt, lte, gt, gte } from "drizzle-orm";
import { ID } from "@/features/core/domain/types/common";

/**
 *
 */
export class DrizzleAttributeRepository implements IAttributeRepository {
  /**
   *
   */
  async getAllDefinitions(): Promise<AttributeDefinition[]> {
    const results = await db
      .select()
      .from(attributeDefinitions)
      .orderBy(attributeDefinitions.sortOrder);
    return results as AttributeDefinition[];
  }

  /**
   *
   */
  async getFilterableDefinitions(): Promise<AttributeDefinition[]> {
    const results = await db
      .select()
      .from(attributeDefinitions)
      .where(eq(attributeDefinitions.isFilterable, true))
      .orderBy(attributeDefinitions.sortOrder);
    return results as AttributeDefinition[];
  }

  /**
   *
   */
  async createDefinition(input: CreateAttributeDefinition): Promise<AttributeDefinition> {
    const [result] = await db.insert(attributeDefinitions).values(input).returning();
    return result as AttributeDefinition;
  }

  /**
   *
   */
  async updateDefinition(
    id: ID,
    input: Partial<CreateAttributeDefinition>,
  ): Promise<AttributeDefinition> {
    const [result] = await db
      .update(attributeDefinitions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(attributeDefinitions.id, id))
      .returning();
    return result as AttributeDefinition;
  }

  /**
   *
   */
  async deleteDefinition(id: ID): Promise<void> {
    await db.delete(attributeDefinitions).where(eq(attributeDefinitions.id, id));
  }

  /**
   *
   */
  async getProductAttributes(productId: ID): Promise<ProductAttributeValue[]> {
    const results = await db
      .select({
        attributeId: productAttributes.attributeId,
        key: attributeDefinitions.key,
        valueText: productAttributes.valueText,
        valueNum: productAttributes.valueNum,
        valueBool: productAttributes.valueBool,
      })
      .from(productAttributes)
      .innerJoin(attributeDefinitions, eq(productAttributes.attributeId, attributeDefinitions.id))
      .where(eq(productAttributes.productId, productId));

    return results.map((r) => ({
      ...r,
      valueNum: r.valueNum ? Number(r.valueNum) : undefined,
    })) as ProductAttributeValue[];
  }

  /**
   *
   */
  async setProductAttributes(productId: ID, values: ProductAttributeValue[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(productAttributes).where(eq(productAttributes.productId, productId));
      if (values.length > 0) {
        await tx.insert(productAttributes).values(
          values.map((v) => ({
            productId,
            attributeId: v.attributeId,
            valueText: v.valueText,
            valueNum: v.valueNum ? String(v.valueNum) : null,
            valueBool: v.valueBool,
          })),
        );
      }
    });
  }

  /**
   *
   */
  async getMatchedProductIds(filters: AttributeFilter[]): Promise<ID[]> {
    if (filters.length === 0) return [];

    // This is a complex query: find products that match ALL filters (intersection)
    // We can use a subquery per filter or a GROUP BY + HAVING approach.

    // For now, let's implement a simplified version that handles one filter,
    // or we'll properly join this in DrizzleProductRepository.getFiltered.

    return [];
  }
}
