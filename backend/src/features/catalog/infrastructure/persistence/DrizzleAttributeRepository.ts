import { db } from '@findeg/db/connection';
import { attributes, productAttributes } from '@findeg/db/schema';
import {
  IAttributeRepository,
  AttributeFilter,
} from '../../application/interfaces/IAttributeRepository';
import {
  Attribute,
  CreateAttribute,
  ProductAttributeValue,
} from '../../domain/entities/Attribute';
import { eq } from 'drizzle-orm';
import { ID } from '@findeg/backend/features/core/domain/types/common';

export class DrizzleAttributeRepository implements IAttributeRepository {
  async getAllDefinitions(): Promise<Attribute[]> {
    const results = await db
      .select()
      .from(attributes)
      .orderBy(attributes.sortOrder);
    return results as Attribute[];
  }

  async getFilterableDefinitions(): Promise<Attribute[]> {
    const results = await db
      .select()
      .from(attributes)
      .where(eq(attributes.isFilterable, true))
      .orderBy(attributes.sortOrder);
    return results as Attribute[];
  }

  async createDefinition(input: CreateAttribute): Promise<Attribute> {
    const [result] = await db.insert(attributes).values(input).returning();
    return result as Attribute;
  }

  async updateDefinition(
    id: ID,
    input: Partial<CreateAttribute>,
  ): Promise<Attribute> {
    const [result] = await db
      .update(attributes)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(attributes.id, id))
      .returning();
    return result as Attribute;
  }

  async deleteDefinition(id: ID): Promise<void> {
    await db.delete(attributes).where(eq(attributes.id, id));
  }

  async getProductAttributes(productId: ID): Promise<ProductAttributeValue[]> {
    const results = await db
      .select({
        attributeId: productAttributes.attributeId,
        key: attributes.key,
        valueText: productAttributes.valueText,
      })
      .from(productAttributes)
      .innerJoin(attributes, eq(productAttributes.attributeId, attributes.id))
      .where(eq(productAttributes.productId, productId));

    return results.map((r) => ({
      attributeId: r.attributeId,
      key: r.key,
      valueText: r.valueText || undefined,
    })) as ProductAttributeValue[];
  }

  async setProductAttributes(productId: ID, values: ProductAttributeValue[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(productAttributes).where(eq(productAttributes.productId, productId));
      if (values.length > 0) {
        await tx.insert(productAttributes).values(
          values.map((v) => ({
            productId,
            attributeId: v.attributeId,
            valueText: v.valueText,
          })),
        );
      }
    });
  }

  async getMatchedProductIds(filters: AttributeFilter[]): Promise<ID[]> {
    if (filters.length === 0) return [];
    return [];
  }
}
