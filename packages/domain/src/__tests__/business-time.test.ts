import { describe, expect, it } from 'vitest';
import { BUSINESS_TIME_ZONE, businessDateOf, businessMonthOf } from '@findeg/domain/orders';

// Ported from partner-sales' Cairo-time boundary tests (ADR-0010).
describe('FindEg business time', () => {
  it('is Cairo time', () => {
    expect(BUSINESS_TIME_ZONE).toBe('Africa/Cairo');
  });

  it.each([
    ['winter (UTC+2): the last minutes of January', '2026-01-31T21:30:00Z', '2026-01-31'],
    ['winter (UTC+2): the first minutes of February', '2026-01-31T22:30:00Z', '2026-02-01'],
    ['summer (UTC+3): the last minutes of July', '2026-07-31T20:30:00Z', '2026-07-31'],
    ['summer (UTC+3): August, still July under UTC+2', '2026-07-31T21:30:00Z', '2026-08-01'],
    ['the day before summer time skips midnight', '2026-04-23T21:59:00Z', '2026-04-23'],
    ['the first instant after the skipped midnight', '2026-04-23T22:00:00Z', '2026-04-24'],
    ['the first pass of the repeated hour', '2026-10-29T20:30:00Z', '2026-10-29'],
    ['the second pass of the repeated hour', '2026-10-29T21:30:00Z', '2026-10-29'],
    ['midnight after summer time ends', '2026-10-29T22:00:00Z', '2026-10-30'],
    ['the first second of a summer day', '2026-05-09T21:00:00Z', '2026-05-10'],
    ['the last second of a summer day', '2026-05-10T20:59:59Z', '2026-05-10'],
  ])('dates %s in Cairo', (_name, instant, date) => {
    expect(businessDateOf(new Date(instant))).toBe(date);
  });

  it.each([
    ['00:30 on 1 May in Cairo, still April in UTC', '2026-04-30T21:30:00Z', '2026-05'],
    ['23:30 on 30 April in Cairo', '2026-04-30T20:30:00Z', '2026-04'],
    ['New Year in Cairo, still December in UTC', '2026-12-31T22:30:00Z', '2027-01'],
  ])('places %s in its Cairo month', (_name, instant, month) => {
    expect(businessMonthOf(new Date(instant))).toBe(month);
  });
});
