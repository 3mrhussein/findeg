import { ID, IdSchema } from "../types/common";

/**
 * Domain Mapping Utilities
 *
 * Provides standardized methods for converting types between layers.
 */

/**
 * Safe casting and validation of business IDs using the domain schema.
 * @throws {ZodError} if the value is not a valid ID.
 */
export const toDomainID = (val: string | number | null | undefined): ID => {
  return IdSchema.parse(val);
};
