import { describe, expect, it } from 'vitest';
import { API_SUCCESS_MESSAGES, DOMAIN_DEFAULTS } from '../index';

describe('catalog messages', () => {
  it('exposes the success messages verbatim', () => {
    expect(API_SUCCESS_MESSAGES.VARIANT_PRICING_UPDATED).toBe(
      'Variant pricing updated successfully',
    );
    expect(API_SUCCESS_MESSAGES.VARIANT_UOMS_UPDATED).toBe('Variant UoMs updated successfully');
  });

  it('takes the currency from the Domain default', () => {
    expect(DOMAIN_DEFAULTS.CURRENCY).toMatch(/^[A-Z]{3}$/);
    expect(DOMAIN_DEFAULTS.VARIANT_KEY).toBe('default');
  });
});
