import { expect, it } from 'vitest';
import { summarizeRewardStatement } from '../public.js';
it('reconciles exact value and point balances without exposing order details', () => {
  const createdAt = new Date();
  expect(
    summarizeRewardStatement([
      {
        partnerId: 1,
        orderReference: 'order',
        eventType: 'accepted',
        points: 100,
        value: '1.25',
        createdAt,
      },
      {
        partnerId: 1,
        orderReference: 'order',
        eventType: 'paid',
        points: 100,
        value: '1.25',
        createdAt,
      },
      {
        partnerId: 1,
        orderReference: 'settlement',
        eventType: 'settlement',
        points: 40,
        value: '0.50',
        createdAt,
      },
    ]),
  ).toEqual({
    points: { pending: '0', earned: '100', reversed: '0', settled: '40', available: '60' },
    value: {
      pending: '0.00',
      earned: '1.25',
      reversed: '0.00',
      settled: '0.50',
      available: '0.75',
    },
  });
});
it('retains exact large valuations and reports unknown historical valuation explicitly', () => {
  const event = {
    partnerId: 1,
    orderReference: 'order',
    eventType: 'paid' as const,
    points: 100,
    value: '9999999999999999.99',
    createdAt: new Date(),
  };
  expect(summarizeRewardStatement([event]).value?.available).toBe('9999999999999999.99');
  expect(summarizeRewardStatement([{ ...event, value: null }]).value).toBeNull();
});
