import { describe, expect, it } from 'vitest';
import {
  AttributeDataTypeSchema as attributeDataTypeSchema,
  AttributeSchema as attributeSchema,
} from '../index';

describe('attribute entity', () => {
  it('accepts a known data type and rejects an unknown one', () => {
    const dataType = attributeDataTypeSchema.options[0];
    expect(attributeDataTypeSchema.safeParse(dataType).success).toBe(true);
    expect(attributeDataTypeSchema.safeParse('not-a-type').success).toBe(false);
  });

  it('parses a stored attribute', () => {
    const parsed = attributeSchema.parse({
      id: 1,
      key: 'color',
      dataType: attributeDataTypeSchema.options[0],
      localizedLabel: { en: 'Color', ar: 'اللون' },
      isFilterable: true,
      sortOrder: 0,
    });
    expect(parsed.key).toBe('color');
  });
});
