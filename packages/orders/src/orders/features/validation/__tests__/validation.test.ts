import { describe, expect, it } from 'vitest';
import { filtersSchema, orderId, pageSize, positiveId, statsOptionsSchema } from '../index';

describe('Order identifiers', () => {
  it('accepts positive integers and canonical numeric strings', () => {
    expect(positiveId.parse(7)).toBe(7);
    expect(orderId.parse('42')).toBe(42);
  });

  it.each([0, -1, 1.5, 2_147_483_648, Number.NaN])('rejects the number %s', (value) => {
    expect(() => positiveId.parse(value)).toThrow();
    expect(() => orderId.parse(value)).toThrow();
  });

  it.each(['', '012', '4x', '0'])('rejects the string %j', (value) => {
    expect(() => orderId.parse(value)).toThrow();
  });
});

describe('Order list filters', () => {
  it('bounds the page size at 100', () => {
    expect(pageSize.parse(100)).toBe(100);
    expect(() => pageSize.parse(101)).toThrow();
  });

  it('accepts a search and rejects an unknown status filter', () => {
    expect(filtersSchema.parse({ search: 'FE-' })).toEqual({ search: 'FE-' });
    expect(() => filtersSchema.parse({ status: 'lost' })).toThrow();
  });

  it('rejects a reversed date range', () => {
    expect(() =>
      filtersSchema.parse({
        startDate: new Date('2026-10-09'),
        endDate: new Date('2026-10-01'),
      }),
    ).toThrow('Reversed date range');
  });
});

describe('Order statistics options', () => {
  it('applies the trend and top-product defaults', () => {
    expect(statsOptionsSchema.parse({})).toEqual({ trendDays: 30, topProductsLimit: 5 });
  });

  it.each([{ from: '2026-02-30' }, { to: '0000-12-31' }, { to: 'bad' }])(
    'rejects an invalid calendar date %j',
    (options) => {
      expect(() => statsOptionsSchema.parse(options)).toThrow();
    },
  );

  it('rejects a reversed range and out-of-bound trend or top-product limits', () => {
    expect(() => statsOptionsSchema.parse({ from: '2026-10-09', to: '2026-10-01' })).toThrow(
      'Reversed date range',
    );
    expect(() => statsOptionsSchema.parse({ trendDays: 367 })).toThrow();
    expect(() => statsOptionsSchema.parse({ topProductsLimit: 0 })).toThrow();
  });
});
