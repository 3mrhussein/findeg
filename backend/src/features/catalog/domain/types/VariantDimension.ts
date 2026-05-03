/**
 * VariantDimension — Domain Type
 *
 * Represents one axis of variation for a product.
 * e.g. "Color" with options ["blue", "red", "black"]
 *
 * Used by the admin UI matrix builder and the application
 * service that generates variant combinations.
 */

export interface VariantDimension {
  /** Attribute key from attribute_definitions e.g. "color", "tip_size" */
  attributeKey: string;
  /** Localized display label for the selector */
  label: { en: string; ar: string };
  /** The set of option values for this dimension */
  options: string[];
  /** Whether this attribute is variant-defining (contributes to variantKey) */
  isVariantDefining: true;
}

/**
 * A single combination produced by the matrix builder.
 * e.g. { color: "blue", tip_size: "0.7" }
 */
export type VariantCombination = Record<string, string>;

/**
 * Generates all combinations from a set of dimensions.
 * Pure function — no side effects, fully testable.
 *
 * @example
 * generateVariantMatrix([
 *   { attributeKey: "color",    options: ["blue", "red"] },
 *   { attributeKey: "tip_size", options: ["0.5", "0.7"] }
 * ])
 * // → [
 * //   { color: "blue", tip_size: "0.5" },
 * //   { color: "blue", tip_size: "0.7" },
 * //   { color: "red",  tip_size: "0.5" },
 * //   { color: "red",  tip_size: "0.7" },
 * // ]
 */
export function generateVariantMatrix(
  dimensions: Pick<VariantDimension, 'attributeKey' | 'options'>[],
): VariantCombination[] {
  if (!dimensions.length) return [];

  return dimensions.reduce<VariantCombination[]>((combinations, dimension) => {
    if (!combinations.length) {
      return dimension.options.map((opt) => ({
        [dimension.attributeKey]: opt,
      }));
    }
    return combinations.flatMap((combo) =>
      dimension.options.map((opt) => ({
        ...combo,
        [dimension.attributeKey]: opt,
      })),
    );
  }, []);
}
