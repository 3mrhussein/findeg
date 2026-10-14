import { describe, expect, it } from 'vitest';
import { asTranslationMap, parse, pick } from '../../catalog-contracts/index';

describe('catalogue translation contracts', () => {
  it('fills missing translations and selects a requested locale', () => {
    expect(pick(asTranslationMap({ en: 'Notebook' }, 'Unavailable'), 'ar')).toBe('Unavailable');
    expect(parse('unsupported')).toBe('en');
  });
});
