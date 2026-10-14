import { describe, expect, it } from 'vitest';
import { CACHE_TAGS } from '../index';

describe('CACHE_TAGS', () => {
  it('namespaces collection tags under catalog:', () => {
    expect(CACHE_TAGS.CATALOG_PRODUCTS).toBe('catalog:products');
    expect(CACHE_TAGS.CATALOG_REVIEWS).toBe('catalog:reviews');
  });

  it('builds entity-level tags from ids and slugs', () => {
    expect(CACHE_TAGS.productDetail(7)).toBe('catalog:product:7');
    expect(CACHE_TAGS.categoryDetail('pens')).toBe('catalog:category:pens');
    expect(CACHE_TAGS.tagDetail(3)).toBe('catalog:tag:3');
    expect(CACHE_TAGS.collectionDetail(9)).toBe('catalog:collection:9');
  });
});
