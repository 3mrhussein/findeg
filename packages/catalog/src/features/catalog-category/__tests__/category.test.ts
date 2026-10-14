import { describe, expect, it } from 'vitest';
import {
  CategoryEntity,
  CreateCategorySchema,
  UpdateCategorySchema,
  type Category,
} from '../index';

const category = (overrides: Partial<Category> = {}): Category =>
  ({
    id: 1,
    slug: 'pens',
    name: 'Pens',
    description: 'Base description',
    localizedContent: { name: { en: 'Pens', ar: 'أقلام' }, description: { en: '', ar: 'وصف' } },
    ...overrides,
  }) as Category;

describe('category schemas', () => {
  it('requires a slug and name on create', () => {
    expect(CreateCategorySchema.safeParse({ slug: 'pens', name: 'Pens' }).success).toBe(true);
    expect(CreateCategorySchema.safeParse({ slug: 'pens' }).success).toBe(false);
  });

  it('requires an id on update', () => {
    expect(UpdateCategorySchema.safeParse({ name: 'x' }).success).toBe(false);
    expect(UpdateCategorySchema.safeParse({ id: 1, name: 'x' }).success).toBe(true);
  });
});

describe('CategoryEntity', () => {
  it('localizes the name and description with fallbacks', () => {
    const entity = new CategoryEntity(category());
    expect(entity.getName('ar')).toBe('أقلام');
    expect(entity.getName('en')).toBe('Pens');
    expect(entity.getDescription('ar')).toBe('وصف');
    expect(entity.getDescription('en')).toBe('Base description');
    expect(entity.getSlug()).toBe('pens');
  });

  it('returns an empty description when none exists', () => {
    const entity = new CategoryEntity(
      category({ description: undefined, localizedContent: undefined }),
    );
    expect(entity.getDescription('en')).toBe('');
  });
});
