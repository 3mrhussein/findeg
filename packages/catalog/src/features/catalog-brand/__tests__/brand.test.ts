import { describe, expect, it } from 'vitest';
import { BrandSchema, CreateBrandSchema, UpdateBrandSchema } from '../index';

const brand = {
  id: 1,
  slug: 'acme',
  localizedName: { en: 'Acme', ar: 'اكمي' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('brand schemas', () => {
  it('defaults isActive on a stored brand', () => {
    expect(BrandSchema.parse(brand).isActive).toBe(true);
  });

  it('omits identity and timestamps from the create shape', () => {
    const created = CreateBrandSchema.parse({ slug: 'acme', localizedName: brand.localizedName });
    expect(created).not.toHaveProperty('id');
    expect(created).not.toHaveProperty('createdAt');
  });

  it('requires an id on updates but makes other fields optional', () => {
    expect(UpdateBrandSchema.safeParse({ slug: 'acme' }).success).toBe(false);
    expect(UpdateBrandSchema.safeParse({ id: 1 }).success).toBe(true);
  });
});
