import { describe, expect, it } from 'vitest';
import { Sku as sku } from '../index';

describe('Sku.suggestVariantSku', () => {
  it('joins the upper-cased prefix and attribute values with single hyphens', () => {
    expect(sku.suggestVariantSku('FC-GRIP', ['blue', '0.7'])).toBe('FC-GRIP-BLUE-0-7');
  });

  it('replaces non-alphanumeric characters and trims edge hyphens', () => {
    expect(sku.suggestVariantSku('  pen ', ['a b', '!!'])).toBe('PEN-A-B');
  });
});
