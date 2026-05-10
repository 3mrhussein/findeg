import { z } from 'zod';
import { uomCodeEnum, customerGroupEnum } from '../schema/enums';

/**
 * Catalog Primitives for Database Layer
 */

export const UomCodeSchema = z.enum(uomCodeEnum.enumValues);
export type UomCode = z.infer<typeof UomCodeSchema>;

export const CustomerGroupSchema = z.enum(customerGroupEnum.enumValues);
export type CustomerGroup = z.infer<typeof CustomerGroupSchema>;

export type MatchRulesDraft = {
  categoryId?: number;
  brandIds?: number[];
  tags?: string[];
  attributes?: Record<string, string | number | boolean>;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
};
