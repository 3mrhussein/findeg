/**
 * Domain Entity: Attribute
 *
 * Defines a product specification/attribute that can be used for filtering.
 */

import { z } from 'zod';
import { IdSchema, TranslationMapSchema } from '../../../core/domain/types/common';

export const AttributeDataTypeSchema = z.enum(['string', 'number', 'boolean', 'enum']);
export type AttributeDataType = z.infer<typeof AttributeDataTypeSchema>;

export const AttributeSchema = z.object({
  id: IdSchema,
  key: z.string(),
  dataType: AttributeDataTypeSchema,
  unit: z.string().optional(),
  localizedLabel: TranslationMapSchema,
  enumValues: z.array(z.string()).optional(),
  isFilterable: z.boolean(),
  sortOrder: z.number(),
});

export type Attribute = z.infer<typeof AttributeSchema>;

/**
 * Represents a concrete attribute value assigned to a product.
 */
export const ProductAttributeValueSchema = z.object({
  attributeId: IdSchema,
  key: z.string(), // key from definition for convenience
  valueText: z.string().optional(),
});

export type ProductAttributeValue = z.infer<typeof ProductAttributeValueSchema>;

export const CreateAttributeSchema = AttributeSchema.omit({ id: true });
export type CreateAttribute = z.infer<typeof CreateAttributeSchema>;
