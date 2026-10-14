import { describe, expect, it } from 'vitest';
import { BrandInputSchema as brandInputSchema } from '../index';

const valid = { slug: 'acme', nameEn: 'Acme', nameAr: 'اكمي' };

describe('BrandInputSchema', () => {
  it('accepts a complete brand and defaults isActive to true', () => {
    const parsed = brandInputSchema.parse(valid);
    expect(parsed.isActive).toBe(true);
  });

  it('rejects an empty English or Arabic name with its message', () => {
    const result = brandInputSchema.safeParse({ ...valid, nameEn: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Name (English) is required');
    const arabic = brandInputSchema.safeParse({ ...valid, nameAr: '' });
    expect(arabic.error?.issues[0].message).toBe('Name (Arabic) is required');
  });

  it('accepts an empty logo URL and rejects a malformed one', () => {
    expect(brandInputSchema.safeParse({ ...valid, logoUrl: '' }).success).toBe(true);
    expect(brandInputSchema.safeParse({ ...valid, logoUrl: 'not-a-url' }).success).toBe(false);
  });
});
