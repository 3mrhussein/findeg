import { expect, it } from 'vitest';
import { summarizeRewardStatement } from '../public.js';
import { canCorrectReward, correctionValue, allocateRewardValue } from '../corrections.js';
import type { PartnerRewardCorrectionInput } from '../contracts.js';
import type { ValuedRewardEvent } from '../corrections.js';

/**
 * Exercises the same composition `infrastructure/persistence.ts:recordCorrection` uses —
 * canCorrectReward -> correctionValue -> append -> re-summarize — rather than each pure
 * function in isolation, so a bug in how they're wired together would show up here.
 */
function applyCorrection(
  prior: readonly ValuedRewardEvent[],
  correction: PartnerRewardCorrectionInput,
) {
  expect(canCorrectReward(prior, correction.action, correction.points)).toBe(true);
  const value = correctionValue(prior, correction);
  const sign =
    correction.action === 'refund' ||
    correction.action === 'cancellation' ||
    correction.action === 'reversal'
      ? -1
      : 1;
  const event: ValuedRewardEvent = {
    partnerId: 1,
    orderReference: correction.orderReference,
    eventType: correction.action,
    points: sign * correction.points,
    value: value ?? null,
    createdAt: new Date(),
  };
  return { value, events: [...prior, event] };
}

const createdAt = new Date();

it('settles part of the available balance, leaving the remainder available', () => {
  const prior: readonly ValuedRewardEvent[] = [
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
  ];
  const { value, events } = applyCorrection(prior, {
    key: 'settle-1',
    action: 'settlement',
    orderReference: 'settlement',
    points: 40,
  });
  expect(value).toBe('0.50');
  expect(summarizeRewardStatement(events)).toEqual({
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

it('cancels an order, splitting the value across its pending and earned portions', () => {
  const prior: readonly ValuedRewardEvent[] = [
    {
      partnerId: 1,
      orderReference: 'order',
      eventType: 'accepted',
      points: 100,
      value: '2.00',
      createdAt,
    },
    {
      partnerId: 1,
      orderReference: 'order',
      eventType: 'paid',
      points: 60,
      earnedPoints: 60,
      value: '1.20',
      createdAt,
    },
  ];
  const { value, events } = applyCorrection(prior, {
    key: 'cancel-1',
    action: 'cancellation',
    orderReference: 'order',
    points: 70,
  });
  expect(value).toBe('-1.40');
  const statement = summarizeRewardStatement(events);
  expect(statement.points).toEqual({
    pending: '0',
    earned: '30',
    reversed: '70',
    settled: '0',
    available: '30',
  });
});

it('allocates an adjustment proportionally, giving the exact rounding remainder to the last share', () => {
  const prior: readonly ValuedRewardEvent[] = [
    {
      partnerId: 1,
      orderReference: 'order-a',
      eventType: 'accepted',
      points: 3,
      value: '1.00',
      createdAt,
    },
  ];
  const first = applyCorrection(prior, {
    key: 'adjust-1',
    action: 'adjustment',
    orderReference: 'order-a',
    points: -1,
  });
  expect(first.value).toBe('-0.33');

  const second = applyCorrection(prior, {
    key: 'adjust-2',
    action: 'adjustment',
    orderReference: 'order-a',
    points: -2,
  });
  expect(second.value).toBe('-0.67');

  // The two proportional shares of the same total sum to it exactly, remainder included.
  expect(allocateRewardValue('1.00', 1n, 3n) + '+' + allocateRewardValue('1.00', 2n, 3n)).toBe(
    '0.33+0.67',
  );
});
