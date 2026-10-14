import { describe, expect, it } from 'vitest';
import { Sku } from '../index';

describe('Sku.suggestVariantSku', () => {
  it('joins the upper-cased prefix and attribute values with single hyphens', () => {
    expect(Sku.suggestVariantSku('FC-GRIP', ['blue', '0.7'])).toBe('FC-GRIP-BLUE-0-7');
  });

  it('replaces non-alphanumeric characters and trims edge hyphens', () => {
    expect(Sku.suggestVariantSku('  pen ', ['a b', '!!'])).toBe('PEN-A-B');
  });
});
