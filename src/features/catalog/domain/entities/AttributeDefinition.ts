/**
 * Domain Entity: AttributeDefinition
 *
 * Defines a product specification/attribute that can be used for filtering.
 */

import { z } from "zod";
import { IdSchema, LocalizedStringSchema } from "@/features/core/domain/types/common";

/** Supported data types for attributes */
export const AttributeDataTypeSchema = z.enum(["string", "number", "boolean", "enum"]);
export type AttributeDataType = z.infer<typeof AttributeDataTypeSchema>;

/**
 * Attribute Definition Domain Schema
 */
export const AttributeDefinitionSchema = z.object({
  id: IdSchema,
  key: z.string(),
  dataType: AttributeDataTypeSchema,
  unit: z.string().optional(),
  localizedLabel: LocalizedStringSchema,
  enumValues: z.array(z.string()).optional(),
  isFilterable: z.boolean(),
  sortOrder: z.number(),
});

export type AttributeDefinition = z.infer<typeof AttributeDefinitionSchema>;

/**
 * Represents a concrete attribute value assigned to a product.
 */
export const ProductAttributeValueSchema = z.object({
  attributeId: IdSchema,
  key: z.string(), // key from definition for convenience
  valueText: z.string().optional(),
  valueNum: z.number().optional(),
  valueBool: z.boolean().optional(),
});

export type ProductAttributeValue = z.infer<typeof ProductAttributeValueSchema>;

/** Input for creating a new attribute definition */
export const CreateAttributeDefinitionSchema = AttributeDefinitionSchema.omit({ id: true });
export type CreateAttributeDefinition = z.infer<typeof CreateAttributeDefinitionSchema>;
