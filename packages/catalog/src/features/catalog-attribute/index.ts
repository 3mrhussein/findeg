/**
 * Domain Entity: Attribute
 *
 * Defines a product specification/attribute that can be used for filtering.
 */

import { z } from 'zod';
import { ATTRIBUTE_DATA_TYPES } from '@findeg/domain';
import {
  IdSchema as idSchema,
  TranslationMapSchema as translationMapSchema,
} from '@findeg/db/types';

const attributeDataTypeSchema = z.enum(ATTRIBUTE_DATA_TYPES);
export type AttributeDataType = z.infer<typeof attributeDataTypeSchema>;

const attributeSchema = z.object({
  id: idSchema,
  key: z.string(),
  dataType: attributeDataTypeSchema,
  unit: z.string().optional(),
  localizedLabel: translationMapSchema,
  enumValues: z.array(z.string()).optional(),
  isFilterable: z.boolean(),
  sortOrder: z.number(),
});

export type Attribute = z.infer<typeof attributeSchema>;

/**
 * Represents a concrete attribute value assigned to a product.
 */
const productAttributeValueSchema = z.object({
  attributeId: idSchema,
  key: z.string(), // key from definition for convenience
  valueText: z.string().optional(),
});

export type ProductAttributeValue = z.infer<typeof productAttributeValueSchema>;

const createAttributeSchema = attributeSchema.omit({ id: true });
export type CreateAttribute = z.infer<typeof createAttributeSchema>;

export {
  attributeDataTypeSchema as AttributeDataTypeSchema,
  attributeSchema as AttributeSchema,
  productAttributeValueSchema as ProductAttributeValueSchema,
  createAttributeSchema as CreateAttributeSchema,
};
