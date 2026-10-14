import { describe, expect, it } from 'vitest';
import { fuzzySearchProducts } from '../index';
import type { Product } from '../../catalog-product/index';

const product = (id: number, overrides: Partial<Product> = {}) =>
  ({
    id,
    name: 'Blue Pen',
    description: 'Smooth ink',
    longDescription: '',
    variants: [{ sku: `PEN-${String(id)}` }],
    brandName: 'Acme',
    categoryName: 'Pens',
    ...overrides,
  }) as unknown as Product;

describe('fuzzySearchProducts', () => {
  const products = [
    product(2, { name: 'Red Marker', description: '', brandName: '', categoryName: '' }),
    product(1),
    product(3, { name: 'Gel Pencil', description: 'Writes smoothly', variants: [] }),
  ];

  it('returns nothing for a blank query', () => {
    expect(fuzzySearchProducts(products, '   ')).toEqual([]);
  });

  it('ranks an exact phrase match first and breaks ties by id', () => {
    const ids = fuzzySearchProducts(products, 'blue pen').map((p) => p.id);
    expect(ids[0]).toBe(1);
  });

  it('matches typos and token prefixes', () => {
    expect(fuzzySearchProducts(products, 'blu pn').map((p) => p.id)).toContain(1);
    expect(fuzzySearchProducts(products, 'mark').map((p) => p.id)).toEqual([2]);
  });

  it('matches on SKUs and on accent-insensitive text', () => {
    expect(fuzzySearchProducts(products, 'pen-1').map((p) => p.id)).toContain(1);
    expect(
      fuzzySearchProducts([product(9, { name: 'Café', description: '' })], 'cafe').map((p) => p.id),
    ).toEqual([9]);
  });

  it('drops products below the minimum score', () => {
    expect(fuzzySearchProducts(products, 'zzzzqqq')).toEqual([]);
  });

  it('handles products without any searchable field', () => {
    const empty = product(7, {
      name: '',
      description: '',
      longDescription: '',
      variants: [],
      brandName: '',
      categoryName: '',
    });
    expect(fuzzySearchProducts([empty], 'anything')).toEqual([]);
  });
});
