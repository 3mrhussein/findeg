import { describe, expect, it } from 'vitest';
import { generateVariantMatrix } from '../index';

describe('generateVariantMatrix', () => {
  it('returns no combinations for no dimensions', () => {
    expect(generateVariantMatrix([])).toEqual([]);
  });

  it('builds the cartesian product of the dimensions in order', () => {
    expect(
      generateVariantMatrix([
        { attributeKey: 'color', options: ['blue', 'red'] },
        { attributeKey: 'tip_size', options: ['0.5', '0.7'] },
      ]),
    ).toEqual([
      { color: 'blue', tip_size: '0.5' },
      { color: 'blue', tip_size: '0.7' },
      { color: 'red', tip_size: '0.5' },
      { color: 'red', tip_size: '0.7' },
    ]);
  });
});
