import { describe, expect, it } from 'vitest';
import { TagInputSchema } from '../index';

const valid = { group: 'audience', key: 'kids', slug: 'kids' };

describe('TagInputSchema', () => {
  it('fills defaults for icon, color, isActive and scope', () => {
    expect(TagInputSchema.parse(valid)).toMatchObject({
      icon: '',
      color: '',
      isActive: true,
      scope: 'catalog',
    });
  });

  it('rejects an empty group, key or slug', () => {
    expect(TagInputSchema.safeParse({ ...valid, group: '' }).success).toBe(false);
    expect(TagInputSchema.safeParse({ ...valid, key: '' }).success).toBe(false);
    expect(TagInputSchema.safeParse({ ...valid, slug: '' }).success).toBe(false);
  });
});
