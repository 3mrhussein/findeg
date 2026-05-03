/**
 * Sku — Value Object
 *
 * Business rules:
 * - 2–100 characters
 * - Uppercase letters, digits, hyphens only
 * - No spaces
 * - Stored and compared in uppercase
 */

/**
 *
 */
export class Sku {
  static readonly PATTERN = /^[A-Z0-9-]{2,100}$/;
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 2;

  /**
   *
   */
  private constructor(private readonly _value: string) {}

  /**
   *
   */
  static create(raw: string): Sku {
    const value = raw.trim().toUpperCase();

    if (value.length < Sku.MIN_LENGTH) {
      throw new Error(`SKU must be at least ${Sku.MIN_LENGTH} characters`);
    }
    if (value.length > Sku.MAX_LENGTH) {
      throw new Error(`SKU must be at most ${Sku.MAX_LENGTH} characters`);
    }
    if (!Sku.PATTERN.test(value)) {
      throw new Error('SKU may only contain uppercase letters, digits, and hyphens');
    }

    return new Sku(value);
  }

  /**
   * Suggest a variant SKU from a product SKU prefix and attribute values.
   * e.g. suggestVariantSku("FC-GRIP", ["blue", "0.7"]) → "FC-GRIP-BLUE-07"
   */
  static suggestVariantSku(prefix: string, attributeValues: string[]): string {
    const parts = [prefix, ...attributeValues];
    return parts
      .map((p) =>
        p
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '-')
          .replace(/-+/g, '-'),
      )
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
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
  equals(other: Sku): boolean {
    return this._value === other._value;
  }

  /**
   *
   */
  toString(): string {
    return this._value;
  }
}
