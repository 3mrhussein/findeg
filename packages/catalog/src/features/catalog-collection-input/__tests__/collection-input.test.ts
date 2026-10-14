import { describe, expect, it } from 'vitest';
import { CollectionInputSchema as collectionInputSchema } from '../index';

const base = { slug: 'summer', localizedTitle: { en: 'Summer', ar: 'صيف' } };

describe('CollectionInputSchema', () => {
  it('applies the sortOrder, isActive and tagIds defaults', () => {
    expect(collectionInputSchema.parse(base)).toMatchObject({
      sortOrder: 0,
      isActive: true,
      tagIds: [],
    });
  });

  it('accepts a per-locale subtitle and rejects unknown locales', () => {
    expect(
      collectionInputSchema.safeParse({ ...base, localizedSubtitle: { en: 'Hot' } }).success,
    ).toBe(true);
    expect(
      collectionInputSchema.safeParse({ ...base, localizedSubtitle: { fr: 'Chaud' } }).success,
    ).toBe(false);
  });
});
