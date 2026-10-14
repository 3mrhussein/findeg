import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import { ORDER_STATUSES } from '@findeg/domain';
import { RESERVATION_STATES, reservationSettlement, reservationState } from '@findeg/domain';

function codeOf(run: () => unknown): string | undefined {
  try {
    run();
    return undefined;
  } catch (error) {
    if (error instanceof DomainError) return (error as DomainError).code;
    throw error;
  }
}

describe('Stock Reservation by Order status', () => {
  it.each([
    ['pending', 'held'],
    ['confirmed', 'held'],
    ['processing', 'held'],
    ['shipped', 'held'],
    ['delivered', 'consumed'],
    ['cancelled', 'released'],
    ['refunded', 'consumed'],
  ] as const)('an Order that is %s has its reservation %s', (status, state) => {
    expect(reservationState(status)).toBe(state);
  });

  it('covers every Order status', () => {
    for (const status of ORDER_STATUSES)
      expect(RESERVATION_STATES).toContain(reservationState(status));
  });

  it.each([
    ['pending', 'confirmed', null],
    ['pending', 'cancelled', 'release'],
    ['confirmed', 'processing', null],
    ['confirmed', 'cancelled', 'release'],
    ['processing', 'shipped', null],
    ['processing', 'cancelled', 'release'],
    ['shipped', 'delivered', 'consume'],
    ['shipped', 'cancelled', 'release'],
    ['delivered', 'refunded', null],
  ] as const)('moving %s → %s settles it with %s', (from, to, settlement) => {
    expect(reservationSettlement(from, to)).toBe(settlement);
  });

  it.each(ORDER_STATUSES)('a same-status change (%s) has no stock effect', (status) => {
    expect(reservationSettlement(status, status)).toBeNull();
  });

  it.each([
    ['cancelled', 'delivered'],
    ['delivered', 'cancelled'],
    ['refunded', 'cancelled'],
  ] as const)('refuses %s → %s: the reservation was settled the other way', (from, to) => {
    expect(codeOf(() => reservationSettlement(from, to))).toBe('RESERVATION_ALREADY_SETTLED');
  });
});
