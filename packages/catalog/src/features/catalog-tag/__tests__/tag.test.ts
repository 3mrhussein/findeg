import { describe, expect, it } from 'vitest';
import {
  CreateTagSchema as createTagSchema,
  TagSchema as tagSchema,
  tagIdentifier,
} from '../index';

const tag = {
  id: 1,
  group: 'audience',
  key: 'kids',
  slug: 'kids',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('tag entity', () => {
  it('defaults the scope to catalog', () => {
    expect(tagSchema.parse(tag).scope).toBe('catalog');
  });

  it('builds the stable identifier from group and key', () => {
    expect(tagIdentifier({ group: 'audience', key: 'kids' })).toBe('audience:kids');
  });

  it('omits identity and timestamps from the create shape', () => {
    expect(
      createTagSchema.parse({ group: 'g', key: 'k', slug: 's', isActive: true }),
    ).not.toHaveProperty('id');
  });
});
