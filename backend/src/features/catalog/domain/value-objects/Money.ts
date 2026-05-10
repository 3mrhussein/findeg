/**
 * Money — Value Object (EGP)
 *
 * Business rules:
 * - Must be a non-negative finite number
 * - Maximum 2 decimal places
 * - Currency is always EGP in Phase 1
 */

/**
 *
 */
export class Money {
  static readonly CURRENCY = 'EGP';

  /**
   *
   */
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string = 'EGP',
  ) {}

  /**
   *
   */
  static create(amount: number, currency = 'EGP'): Money {
    if (!isFinite(amount) || isNaN(amount)) {
      throw new Error('Money amount must be a finite number');
    }
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    // Round to 2 decimal places
    const rounded = Math.round(amount * 100) / 100;
    return new Money(rounded, currency);
  }

  /**
   *
   */
  static zero(): Money {
    return new Money(0);
  }

  /**
   *
   */
  get amount(): number {
    return this._amount;
  }

  /**
   *
   */
  get currency(): string {
    return this._currency;
  }

  /**
   *
   */
  isZero(): boolean {
    return this._amount === 0;
  }

  /**
   *
   */
  isGreaterThan(other: Money): boolean {
    return this._amount > other._amount;
  }

  /**
   *
   */
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   *
   */
  toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }
}
