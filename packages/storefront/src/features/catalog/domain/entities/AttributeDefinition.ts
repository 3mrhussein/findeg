/**
 * Domain Entity: AttributeDefinition
 *
 * Defines a product specification/attribute that can be used for filtering.
 */

import { IdSchema } from "@backend/features/core/domain/types/common";
import { identitySchema } from "@backend/features/core/infrastructure/persistence/schema";
import { LocalizedStringSchema } from "@backend/features/core";
import { z } from "zod";

export const AttributeDataTypeSchema = z.enum(["string", "number", "boolean", "enum"]);
export type AttributeDataType = z.infer<typeof AttributeDataTypeSchema>;

export const AttributeDefinitionSchema = z.object({
  id: identitySchema,
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

export const CreateAttributeDefinitionSchema = AttributeDefinitionSchema.omit({ id: true });
export type CreateAttributeDefinition = z.infer<typeof CreateAttributeDefinitionSchema>;
