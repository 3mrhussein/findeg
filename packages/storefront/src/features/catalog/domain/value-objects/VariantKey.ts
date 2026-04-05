/**
 * VariantKey — Value Object
 *
 * Encodes the business rule: a variant key is built by sorting
 * defining attribute key names alphabetically, then joining
 * their values with a hyphen.
 *
 * This file is the SINGLE SOURCE OF TRUTH for variant key logic.
 * Both the server (AdminProductService) and client (product page
 * variant selector) must import from here — never reimplement inline.
 *
 * @example
 * VariantKey.build([
 *   { key: "tip_size", value: "0.7" },
 *   { key: "color",    value: "Blue" }
 * ])
 * // → "blue-0.7"  (sorted: color < tip_size, values lowercased)
 */

export interface DefiningAttribute {
  key: string; // attribute key name from attribute_definitions
  value: string; // the value for this variant
}

/**
 *
 */
export class VariantKey {
  /**
   *
   */
  private constructor(private readonly _value: string) {}

  /**
   *
   */
  static build(attributes: DefiningAttribute[]): VariantKey {
    if (!attributes.length) {
      throw new Error("VariantKey requires at least one defining attribute");
    }

    const value = attributes
      .filter((a) => a.key.trim() && a.value.trim())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((a) => a.value.toLowerCase().trim().replace(/\s+/g, "-"))
      .join("-");

    if (!value) {
      throw new Error("VariantKey could not be built — all attribute values were empty");
    }

    return new VariantKey(value);
  }

  /**
   *
   */
  static fromString(value: string): VariantKey {
    if (!value.trim()) {
      throw new Error("VariantKey value cannot be empty");
    }
    return new VariantKey(value);
  }

  /**
   *
   */
  get value(): string {
    return this._value;
  }

  /**
   *
   */
  equals(other: VariantKey): boolean {
    return this._value === other._value;
  }

  /**
   *
   */
  toString(): string {
    return this._value;
  }
}
