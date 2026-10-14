import { describe, expect, it } from 'vitest';
import { AttributeDataTypeSchema, AttributeSchema } from '../index';

describe('attribute entity', () => {
  it('accepts a known data type and rejects an unknown one', () => {
    const dataType = AttributeDataTypeSchema.options[0];
    expect(AttributeDataTypeSchema.safeParse(dataType).success).toBe(true);
    expect(AttributeDataTypeSchema.safeParse('not-a-type').success).toBe(false);
  });

  it('parses a stored attribute', () => {
    const parsed = AttributeSchema.parse({
      id: 1,
      key: 'color',
      dataType: AttributeDataTypeSchema.options[0],
      localizedLabel: { en: 'Color', ar: 'اللون' },
      isFilterable: true,
      sortOrder: 0,
    });
    expect(parsed.key).toBe('color');
  });
});
