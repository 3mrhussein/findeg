/**
 * UoMFactor — Value Object
 *
 * Represents how many base units are in one sellable unit.
 * Business rules:
 * - Must be a positive integer (you can't have 1.5 pencils in a pack)
 * - Minimum value is 1 (base unit itself)
 */

/**
 *
 */
export class UoMFactor {
  /**
   *
   */
  private constructor(private readonly _value: number) {}

  /**
   *
   */
  static create(value: number): UoMFactor {
    if (!Number.isInteger(value)) {
      throw new Error('UoMFactor must be an integer');
    }
    if (value < 1) {
      throw new Error('UoMFactor must be at least 1');
    }
    return new UoMFactor(value);
  }

  /** Base unit — factor of 1 (e.g. "piece") */
  static base(): UoMFactor {
    return new UoMFactor(1);
  }

  /**
   *
   */
  get value(): number {
    return this._value;
  }

  /**
   *
   */
  isBase(): boolean {
    return this._value === 1;
  }

  /**
   *
   */
  equals(other: UoMFactor): boolean {
    return this._value === other._value;
  }
}
