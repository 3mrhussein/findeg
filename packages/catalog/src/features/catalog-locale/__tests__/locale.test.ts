import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  asTranslationMap,
  parse,
  pick,
  translationMapBy,
  valid,
} from '../index';

describe('locale helpers', () => {
  it('accepts supported locales and rejects others', () => {
    expect(valid('ar')).toBe(true);
    expect(valid('fr')).toBe(false);
    expect(valid(42)).toBe(false);
  });

  it('parses unknown or missing input to the default locale', () => {
    expect(parse('ar')).toBe('ar');
    expect(parse('xx')).toBe(DEFAULT_LOCALE);
    expect(parse(null)).toBe(DEFAULT_LOCALE);
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });

  it('fills missing locales in a translation map', () => {
    expect(asTranslationMap({ en: 'Product' })).toEqual({ en: 'Product', ar: '' });
    expect(asTranslationMap({}, '-')).toEqual({ en: '-', ar: '-' });
  });

  it('builds a complete map from per-locale text', () => {
    expect(translationMapBy((locale) => (locale === 'en' ? 'Pen' : undefined), 'n/a')).toEqual({
      en: 'Pen',
      ar: 'n/a',
    });
    expect(translationMapBy(() => '')).toEqual({ en: '', ar: '' });
  });

  it('picks the requested locale and falls back to English', () => {
    expect(pick({ en: 'Pen', ar: 'قلم' }, 'ar')).toBe('قلم');
    expect(pick({ en: 'Pen' }, 'ar')).toBe('Pen');
    expect(pick(undefined, 'en')).toBe('');
  });
});
