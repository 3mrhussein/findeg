import { describe, expect, it } from 'vitest';
import { TagInputSchema as tagInputSchema } from '../index';

const valid = { group: 'audience', key: 'kids', slug: 'kids' };

describe('TagInputSchema', () => {
  it('fills defaults for icon, color, isActive and scope', () => {
    expect(tagInputSchema.parse(valid)).toMatchObject({
      icon: '',
      color: '',
      isActive: true,
      scope: 'catalog',
    });
  });

  it('rejects an empty group, key or slug', () => {
    expect(tagInputSchema.safeParse({ ...valid, group: '' }).success).toBe(false);
    expect(tagInputSchema.safeParse({ ...valid, key: '' }).success).toBe(false);
    expect(tagInputSchema.safeParse({ ...valid, slug: '' }).success).toBe(false);
  });
});
