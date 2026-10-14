import { expect, it } from 'vitest';
import { isDateKey, isMonthKey, monthRange, monthsBetween } from '../index';

it('accepts only YYYY-MM month keys with a real month', () => {
  expect(isMonthKey('2026-10')).toBe(true);
  expect(isMonthKey('2026-13')).toBe(false);
  expect(isMonthKey('2026-1')).toBe(false);
  expect(isMonthKey(202610)).toBe(false);
});

it('accepts only real calendar dates written YYYY-MM-DD', () => {
  expect(isDateKey('2028-02-29')).toBe(true);
  expect(isDateKey('2026-02-29')).toBe(false);
  expect(isDateKey('2026-10-1')).toBe(false);
  expect(isDateKey(null)).toBe(false);
});

it('returns the first and last calendar day of a month', () => {
  expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  expect(monthRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
});

it('lists every month between two keys, crossing the year boundary', () => {
  expect(monthsBetween('2026-11', '2027-02')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  expect(monthsBetween('2026-05', '2026-05')).toEqual(['2026-05']);
});
