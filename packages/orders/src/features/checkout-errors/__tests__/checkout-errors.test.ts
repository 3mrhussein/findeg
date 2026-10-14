import { describe, expect, it } from 'vitest';
import { DomainError, InsufficientStockError } from '@findeg/domain';
import {
  ListUnavailableError,
  mapDomainError,
  SelectionInvalidError,
  UnavailableVariantError,
} from '../index';

class CodedDomainError extends DomainError {}

describe('checkout errors', () => {
  it('names the typed checkout failures', () => {
    expect(new UnavailableVariantError().name).toBe('UnavailableVariantError');
    expect(new ListUnavailableError().name).toBe('ListUnavailableError');
    expect(new SelectionInvalidError([3, 4]).listItemIds).toEqual([3, 4]);
  });

  it('maps input failures to a 400 validation error', () => {
    const failure = mapDomainError(new CodedDomainError('INVALID_PHONE', 'bad phone'));
    expect(failure).toMatchObject({
      success: false,
      status: 400,
      error: { code: 'validation-error', message: 'bad phone' },
    });
  });

  it('maps unsupported payment to the cod-only message', () => {
    const failure = mapDomainError(new CodedDomainError('UNSUPPORTED_PAYMENT_METHOD', 'card'));
    expect(failure).toMatchObject({
      status: 400,
      error: { code: 'unsupported-payment-method' },
    });
  });

  it('maps insufficient stock to a 409 with its shortfalls', () => {
    const error = new InsufficientStockError([
      { variantId: 1, requested: 6, available: 5 },
    ] as never);
    expect(mapDomainError(error)).toMatchObject({
      status: 409,
      error: {
        code: 'insufficient-stock',
        shortfalls: [{ variantId: 1, requested: 6, available: 5 }],
      },
    });
  });

  it('leaves unrelated and non-domain errors unmapped', () => {
    expect(mapDomainError(new Error('boom'))).toBeUndefined();
    expect(mapDomainError(new CodedDomainError('SOMETHING_ELSE', 'x'))).toBeUndefined();
  });
});
