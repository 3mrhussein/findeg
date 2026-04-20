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

/**
 * Returns the localized value based on the requested locale,
 * falling back to the primary language.
 */
export const resolveLocalized = (
  val: Record<string, string> | null | undefined,
  locale: string = "en",
): string => {
  if (!val) return "";
  return val[locale] || val["en"] || Object.values(val)[0] || "";
};
