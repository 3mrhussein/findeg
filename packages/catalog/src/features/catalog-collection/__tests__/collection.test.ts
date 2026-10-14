import { describe, expect, it } from 'vitest';
import {
  CollectionSchema as collectionSchema,
  CreateCollectionSchema as createCollectionSchema,
} from '../index';

describe('collection schemas', () => {
  it('parses a stored collection and omits identity from create', () => {
    const stored = {
      id: 1,
      slug: 'summer',
      localizedTitle: { en: 'Summer', ar: 'صيف' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(collectionSchema.safeParse(stored).success).toBe(true);
    expect(
      createCollectionSchema.parse({ slug: 'summer', localizedTitle: stored.localizedTitle }),
    ).not.toHaveProperty('id');
  });
});
