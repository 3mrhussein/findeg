import { DomainError } from '../common';

export type CatalogErrorCode = 'INVALID_SKU' | 'COMPARE_AT_PRICE_NOT_ABOVE_PRICE';

/** A catalogue entry that breaks a catalogue rule. */
export class CatalogError extends DomainError<CatalogErrorCode> {
  constructor(code: CatalogErrorCode, message: string) {
    super(code, message);
  }
}
