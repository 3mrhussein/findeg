import { describe, expect, it } from 'vitest';
import { isOrderReferenceConflict } from '../orders';

const violation = { code: '23505', constraint_name: 'uq_orders_order_reference' };

describe('isOrderReferenceConflict', () => {
  it('matches a bare driver error', () => {
    expect(isOrderReferenceConflict(violation)).toBe(true);
  });

  it('matches a driver error wrapped in a cause chain, as drizzle reports it', () => {
    const wrapped = Object.assign(new Error('Failed query'), { cause: violation });
    expect(isOrderReferenceConflict(wrapped)).toBe(true);
  });

  it('ignores unique violations on other indexes', () => {
    expect(
      isOrderReferenceConflict({ cause: { code: '23505', constraint_name: 'uq_other' } }),
    ).toBe(false);
  });

  it('ignores non-objects', () => {
    expect(isOrderReferenceConflict(null)).toBe(false);
    expect(isOrderReferenceConflict('boom')).toBe(false);
  });
});
