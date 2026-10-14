import { describe, expect, it } from 'vitest';
import { VariantKey } from '../index';

describe('VariantKey', () => {
  it('sorts attribute keys and lower-cases values', () => {
    const key = VariantKey.build([
      { key: 'tip_size', value: '0.7' },
      { key: 'color', value: 'Blue' },
    ]);
    expect(key.value).toBe('blue-0.7');
    expect(key.toString()).toBe('blue-0.7');
  });

  it('collapses inner whitespace in values into hyphens', () => {
    expect(VariantKey.build([{ key: 'finish', value: ' Matte  Black ' }]).value).toBe(
      'matte-black',
    );
  });

  it('rejects an empty attribute list and all-empty values', () => {
    expect(() => VariantKey.build([])).toThrow('at least one defining attribute');
    expect(() => VariantKey.build([{ key: 'color', value: '  ' }])).toThrow(
      'all attribute values were empty',
    );
  });

  it('compares by value and rejects blank strings from fromString', () => {
    const a = VariantKey.fromString('blue');
    expect(a.equals(VariantKey.build([{ key: 'color', value: 'blue' }]))).toBe(true);
    expect(a.equals(VariantKey.fromString('red'))).toBe(false);
    expect(() => VariantKey.fromString('  ')).toThrow('cannot be empty');
  });
});
