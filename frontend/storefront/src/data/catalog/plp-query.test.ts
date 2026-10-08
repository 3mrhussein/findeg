import { describe, expect, it } from 'vitest';
import { parseShopPlpQuery } from './plp-query';

describe('parseShopPlpQuery', () => {
  it('defaults to the first page of the newest products, unfiltered', () => {
    expect(parseShopPlpQuery({})).toEqual({
      sort: 'newest',
      backendSort: 'newest',
      page: 1,
      perPage: 24,
      brandIds: [],
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('reads repeated brandId params, dropping invalid ids', () => {
    expect(parseShopPlpQuery({ brandId: ['3', 'x', '7', '-1'] }).brandIds).toEqual([3, 7]);
    expect(parseShopPlpQuery({ brandId: '5' }).brandIds).toEqual([5]);
  });

  it('reads a price range, ignoring non-numeric or negative bounds', () => {
    expect(parseShopPlpQuery({ minPrice: '10', maxPrice: '25.5' })).toMatchObject({
      minPrice: 10,
      maxPrice: 25.5,
    });
    expect(parseShopPlpQuery({ minPrice: 'abc', maxPrice: '-4' })).toMatchObject({
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('maps storefront sort values to listing sorts, falling back to newest', () => {
    const backend = (sort: string) => parseShopPlpQuery({ sort }).backendSort;
    expect(backend('price-low-high')).toBe('price_asc');
    expect(backend('price-high-low')).toBe('price_desc');
    expect(backend('rating')).toBe('rating');
    expect(backend('popular')).toBe('popular');
    expect(parseShopPlpQuery({ sort: 'bogus' })).toMatchObject({
      sort: 'newest',
      backendSort: 'newest',
    });
  });

  it('accepts only offered page sizes and positive pages', () => {
    expect(parseShopPlpQuery({ page: '3', perPage: '48' })).toMatchObject({
      page: 3,
      perPage: 48,
    });
    expect(parseShopPlpQuery({ page: '0', perPage: '1000' })).toMatchObject({
      page: 1,
      perPage: 24,
    });
  });
});
