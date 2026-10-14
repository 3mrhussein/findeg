import { describe, expect, it } from 'vitest';
import { CategoryInputSchema as categoryInputSchema } from '../index';

const base = { slug: 'stationery', translations: [{ language: 'en', name: 'Stationery' }] };

describe('CategoryInputSchema', () => {
  it('applies sortOrder and isActive defaults', () => {
    const parsed = categoryInputSchema.parse(base);
    expect(parsed.sortOrder).toBe(0);
    expect(parsed.isActive).toBe(true);
  });

  it('requires at least one translation', () => {
    const result = categoryInputSchema.safeParse({ ...base, translations: [] });
    expect(result.error?.issues[0].message).toBe('At least one translation is required');
  });

  it('rejects an unsupported translation language', () => {
    const result = categoryInputSchema.safeParse({
      ...base,
      translations: [{ language: 'fr', name: 'Papeterie' }],
    });
    expect(result.success).toBe(false);
  });
});
