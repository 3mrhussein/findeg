import { describe, expect, it } from 'vitest';
import { CollectionSchema, CreateCollectionSchema } from '../index';

describe('collection schemas', () => {
  it('parses a stored collection and omits identity from create', () => {
    const stored = {
      id: 1,
      slug: 'summer',
      localizedTitle: { en: 'Summer', ar: 'صيف' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(CollectionSchema.safeParse(stored).success).toBe(true);
    expect(
      CreateCollectionSchema.parse({ slug: 'summer', localizedTitle: stored.localizedTitle }),
    ).not.toHaveProperty('id');
  });
});
