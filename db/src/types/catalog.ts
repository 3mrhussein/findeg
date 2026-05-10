import { z } from 'zod';

/**
 * Catalog Primitives for Database Layer
 */


export type MatchRulesDraft = {
  categoryId?: number;
  brandIds?: number[];
  tags?: string[];
  attributes?: Record<string, string | number | boolean>;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
};
